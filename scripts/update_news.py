#!/usr/bin/env python3
import json, re, html, time
from pathlib import Path
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from urllib.parse import urljoin

import feedparser
import requests
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data/news.json"
TZ=ZoneInfo("Asia/Ho_Chi_Minh")
UA="Mozilla/5.0 (compatible; DNGWorksDailyNews/1.0; +https://dngworks.github.io/)"

S=requests.Session()
S.headers.update({"User-Agent":UA,"Accept-Language":"vi,en;q=0.8"})

FEEDS={
 "latest_vn":"https://vnexpress.net/rss/tin-moi-nhat.rss",
 "popular_vn":"https://vnexpress.net/rss/tin-xem-nhieu.rss",
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
    m=re.search(r'<img[^>]+src=["\\\']([^"\\\']+)',content,re.I)
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
        if not video:
            iframe=soup.find("iframe",src=re.compile(r"(youtube\.com/embed|youtu\.be)",re.I))
            if iframe: video=urljoin(r.url,iframe.get("src",""))
        return {"image":urljoin(r.url,image) if image else "", "summary":clean_text(desc), "video":video}
    except Exception:
        return {"image":"","summary":"","video":""}

def item_from_entry(entry, source):
    url=getattr(entry,"link","") or ""
    image=rss_image(entry)
    summary=clean_text(getattr(entry,"summary",""))
    meta={"image":"","summary":"","video":""}
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
        if not item["url"] or item["url"] in seen: continue
        seen.add(item["url"]); out.append(item)
        if len(out)>=limit: break
    return out

def openai_news(limit=4):
    # OpenAI's news page is dynamic; scrape current article links and metadata.
    out=[]
    try:
        r=S.get("https://openai.com/news/",timeout=15)
        r.raise_for_status()
        soup=BeautifulSoup(r.text,"html.parser")
        seen=set()
        for a in soup.find_all("a",href=True):
            href=urljoin(r.url,a["href"])
            if "openai.com/" not in href or href in seen: continue
            if not any(x in href for x in ("/index/","/news/")): continue
            title=clean_text(a.get_text(" ",strip=True),180)
            if len(title)<12: continue
            seen.add(href)
            meta=page_meta(href)
            out.append({"source":"OpenAI","time":"","title":title,"summary":meta["summary"],"url":href,"image":meta["image"],"media":"video" if meta["video"] else "","media_url":meta["video"]})
            if len(out)>=limit: break
    except Exception:
        pass
    return out

def choose_ai(limit=3):
    pool=openai_news(3)
    for source,url in AI_FEEDS:
        try: pool += read_feed(url,source,3)
        except Exception: pass
    out=[]; seen=set()
    for x in pool:
        key=(x["title"] or "").lower()
        if not x["url"] or key in seen: continue
        seen.add(key); out.append(x)
        if len(out)>=limit: break
    return out

def main():
    data={"updated_at":datetime.now(TZ).isoformat(timespec="seconds")}
    data["latest_vn"]=read_feed(FEEDS["latest_vn"],"VnExpress",5)
    data["popular_vn"]=read_feed(FEEDS["popular_vn"],"VnExpress · Xem nhiều",5)
    data["world"]=read_feed(FEEDS["world"],"BBC",3)
    data["markets"]=read_feed(FEEDS["markets"],"BBC Business",3)
    data["ai_news"]=choose_ai(3)

    videos=[]
    for group in ("latest_vn","world","markets","ai_news"):
        for x in data[group]:
            if x.get("media_url"):
                videos.append({"source":x["source"],"title":x["title"],"url":x["media_url"]})
    data["media"]=videos[:3]

    # Never wipe a previously valid snapshot because one provider temporarily failed.
    old={}
    if OUT.exists():
        try: old=json.loads(OUT.read_text(encoding="utf-8"))
        except Exception: pass
    for k,n in (("latest_vn",5),("popular_vn",5),("world",3),("markets",3),("ai_news",3)):
        if len(data.get(k,[])) < max(1,n//2) and old.get(k):
            data[k]=old[k]
    if not data["media"] and old.get("media"):
        data["media"]=old["media"]

    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
    print("Updated",OUT)
    for k in ("latest_vn","popular_vn","world","markets","ai_news","media"):
        print(k,len(data.get(k,[])))

if __name__=="__main__":
    main()
