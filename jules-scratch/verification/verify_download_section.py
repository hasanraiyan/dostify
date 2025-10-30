import os
from playwright.sync_api import sync_playwright, Page, expect

def verify(page: Page):
    # Go to the local index.html file
    page.goto(f"file://{os.getcwd()}/index.html")

    # Locate the section that was changed
    download_section = page.locator("#download-app")

    # Scroll the section into view
    download_section.scroll_into_view_if_needed()

    # Wait for the heading to be visible to ensure content has rendered
    expect(download_section.get_by_role("heading", name="Download Now")).to_be_visible()

    # Take the screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")


with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    verify(page)
    browser.close()
