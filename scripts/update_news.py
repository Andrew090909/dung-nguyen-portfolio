#!/usr/bin/env python3
import json, re, html, time
from pathlib import Path
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from urllib.parse import urljoin, urlsplit, urlunsplit

import feedparser
import requests
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data/news.json"
TZ=ZoneInfo("Asia/Ho_Chi_Minh")
UA="Mozilla/5.0 (compatible; DNGWorksNews/2.0; +https://dngworks.github.io/)"

S=requests.Session()
S.headers.update({
    "User-Agent":UA,
    "Accept-Language":"vi,en;q=0.8",
    "Cache-Control":"no-cache",
})

FEEDS={
 "latest_vn":"https://vnexpress.net/rss/tin-moi-nhat.rss",
 "world":"https://feeds.bbci.co.uk/news/world/rss.xml",
 "markets":"https://feeds.bbci.co.uk/news/business/rss.xml",
}
AI_FEEDS=[
 ("NVIDIA","https://blogs.nvidia.com/feed/"),
 ("Google DeepMind","https://deepmind.google/blog/rss.xml"),
 ("BBC Technology","https://feeds.bbci.co.uk/news/technology/rss.xml"),
]

def clean_text(s, limit=260):
    s=BeautifulSoup(s or "","html.parser").get_text(" ",strip=True)
    s=re.sub(r"\s+"," ",html.unescape(s)).strip()
    return s if len(s)<=limit else s[:limit-1].rsplit(" ",1)[0]+"…"

def parse_time(entry):
    st=getattr(entry,"published_parsed",None) or getattr(entry,"updated_parsed",None)
    if st:
        dt=datetime.fromtimestamp(time.mktime(st),tz=timezone.utc).astimezone(TZ)
        return dt.strftime("%d/%m · %H:%M")
    return ""

def rss_image(entry):
    for key in ("media_content","media_thumbnail"):
        for item in getattr(entry,key,[]) or []:
            u=item.get("url")
            if u: return u
    for e in getattr(entry,"enclosures",[]) or []:
        if (e.get("type") or "").startswith("image") and e.get("href"): return e["href"]
    content=" ".join(str(x.get("value","")) for x in getattr(entry,"content",[]) or [])
    content+=" "+str(getattr(entry,"summary","") or "")
    m=re.search(r'<img[^>]+src=["\']([^"\']+)',content,re.I)
    return m.group(1) if m else ""

def page_meta(url):
    try:
        r=S.get(url,timeout=14,allow_redirects=True)
        r.raise_for_status()
        soup=BeautifulSoup(r.text,"html.parser")
        def meta(*selectors):
            for attrs in selectors:
                tag=soup.find("meta",attrs=attrs)
                if tag and tag.get("content"): return tag["content"].strip()
            return ""
        image=meta({"property":"og:image"},{"name":"twitter:image"})
        desc=meta({"property":"og:description"},{"name":"description"})
        video=meta({"property":"og:video"},{"property":"og:video:url"})
        published=meta({"property":"article:published_time"},{"name":"date"})
        if not video:
            iframe=soup.find("iframe",src=re.compile(r"(youtube\.com/embed|youtu\.be)",re.I))
            if iframe: video=urljoin(r.url,iframe.get("src",""))
        return {
            "image":urljoin(r.url,image) if image else "",
            "summary":clean_text(desc),
            "video":video,
            "published":published,
        }
    except Exception:
        return {"image":"","summary":"","video":"","published":""}

def item_from_entry(entry, source):
    url=getattr(entry,"link","") or ""
    image=rss_image(entry)
    summary=clean_text(getattr(entry,"summary",""))
    meta={"image":"","summary":"","video":"","published":""}
    if url and (not image or len(summary)<60):
        meta=page_meta(url)
    if not image: image=meta["image"]
    if len(summary)<60 and meta["summary"]: summary=meta["summary"]
    return {
      "source":source,
      "time":parse_time(entry),
      "title":clean_text(getattr(entry,"title",""),180),
      "summary":summary,
      "url":url,
      "image":image,
      "media":"video" if meta["video"] else "",
      "media_url":meta["video"],
    }

def read_feed(url, source, limit):
    f=feedparser.parse(url)
    out=[]
    seen=set()
    for e in f.entries:
        item=item_from_entry(e,source)
        key=(item["url"], item["title"].lower())
        if not item["url"] or key in seen: continue
        if len(item["title"]) < 12: continue
        seen.add(key); out.append(item)
        if len(out)>=limit: break
    return out

def vnexpress_popular(limit=5):
    """Scrape the live VnExpress 'most read' page because its legacy RSS can return very old items."""
    out=[]
    seen=set()
    try:
        r=S.get("https://vnexpress.net/tin-xem-nhieu",timeout=15)
        r.raise_for_status()
        soup=BeautifulSoup(r.text,"html.parser")
        for a in soup.find_all("a",href=True):
            href=urljoin(r.url,a["href"])
            parts=urlsplit(href)
            if "vnexpress.net" not in parts.netloc: continue
            clean_url=urlunsplit((parts.scheme,parts.netloc,parts.path,"",""))
            if not re.search(r"-\d+\.html$", parts.path): continue
            if clean_url in seen: continue
            title=clean_text(a.get("title") or a.get_text(" ",strip=True),180)
            if len(title)<18: continue
            seen.add(clean_url)
            meta=page_meta(clean_url)
            if len(meta["summary"])<30: continue
            out.append({
                "source":"VnExpress · Xem nhiều",
                "time":"",
                "title":title,
                "summary":meta["summary"],
                "url":clean_url,
                "image":meta["image"],
                "media":"video" if meta["video"] else "",
                "media_url":meta["video"],
            })
            if len(out)>=limit: break
    except Exception:
        pass
    return out

def openai_news(limit=4):
    """Only collect actual OpenAI article URLs, not navigation/category links."""
    out=[]
    try:
        r=S.get("https://openai.com/news/",timeout=15)
        r.raise_for_status()
        soup=BeautifulSoup(r.text,"html.parser")
        seen=set()
        for a in soup.find_all("a",href=True):
            href=urljoin(r.url,a["href"])
            parts=urlsplit(href)
            if parts.netloc not in ("openai.com","www.openai.com"): continue
            if "/index/" not in parts.path: continue
            href=urlunsplit((parts.scheme,parts.netloc,parts.path,"",""))
            if href in seen: continue
            title=clean_text(a.get_text(" ",strip=True),180)
            if len(title)<14: continue
            seen.add(href)
            meta=page_meta(href)
            if len(meta["summary"])<30: continue
            out.append({
                "source":"OpenAI","time":"","title":title,"summary":meta["summary"],
                "url":href,"image":meta["image"],
                "media":"video" if meta["video"] else "","media_url":meta["video"]
            })
            if len(out)>=limit: break
    except Exception:
        pass
    return out

def choose_ai(limit=3):
    pool=openai_news(4)
    for source,url in AI_FEEDS:
        try: pool += read_feed(url,source,4)
        except Exception: pass
    out=[]; seen=set()
    bad_titles={"skip to main content","global affairs","news","research","safety","company"}
    for x in pool:
        key=(x["title"] or "").strip().lower()
        if not x["url"] or key in seen or key in bad_titles: continue
        if len(x.get("summary",""))<30: continue
        seen.add(key); out.append(x)
        if len(out)>=limit: break
    return out

def fresh_media(data, limit=3):
    videos=[]
    for group in ("latest_vn","world","markets","ai_news"):
        for x in data.get(group,[]):
            if x.get("media_url"):
                videos.append({"source":x["source"],"title":x["title"],"url":x["media_url"]})
    if videos:
        return videos[:limit]
    # Keep this section fresh even when feeds don't expose a direct video URL.
    out=[]
    seen=set()
    for group in ("latest_vn","ai_news","world"):
        for x in data.get(group,[]):
            if x.get("url") and x["url"] not in seen:
                seen.add(x["url"])
                out.append({"source":x["source"],"title":x["title"],"url":x["url"]})
                if len(out)>=limit: return out
    return out

def main():
    old={}
    if OUT.exists():
        try: old=json.loads(OUT.read_text(encoding="utf-8"))
        except Exception: pass

    data={"updated_at":datetime.now(TZ).isoformat(timespec="seconds")}
    data["latest_vn"]=read_feed(FEEDS["latest_vn"],"VnExpress",5)
    data["popular_vn"]=vnexpress_popular(5)
    if len(data["popular_vn"])<3:
        data["popular_vn"]=[
            {**x,"source":"VnExpress · Nổi bật"}
            for x in data["latest_vn"][:5]
        ]
    data["world"]=read_feed(FEEDS["world"],"BBC",3)
    data["markets"]=read_feed(FEEDS["markets"],"BBC Business",3)
    data["ai_news"]=choose_ai(3)

    # Never wipe a previously valid core snapshot because one provider temporarily failed.
    for k,n in (("latest_vn",5),("world",3),("markets",3),("ai_news",3)):
        if len(data.get(k,[])) < max(1,n//2) and old.get(k):
            data[k]=old[k]

    data["media"]=fresh_media(data,3)

    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
    print("Updated",OUT,data["updated_at"])
    for k in ("latest_vn","popular_vn","world","markets","ai_news","media"):
        print(k,len(data.get(k,[])))

if __name__=="__main__":
    main()
