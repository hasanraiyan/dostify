from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get the absolute path to the index.html file
    file_path = os.path.abspath('index.html')
    # Use the file:// protocol to open the local file
    page.goto(f'file://{file_path}')

    # Wait for the redirection to happen and assert the URL
    expect(page).to_have_url("https://dostify-climb.expo.app/")

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
