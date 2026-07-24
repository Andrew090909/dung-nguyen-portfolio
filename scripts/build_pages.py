"""Compatibility entry point.
V9 pages are authored as stable static templates and read editable JSON at runtime.
This command validates the deploy instead of regenerating pages, preventing an Admin publish from overwriting the V9 design.
"""
from validate_site import main  # type: ignore

if __name__ == '__main__':
    main()
