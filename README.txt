
Crosera - Static HTML version (localStorage-based)
-------------------------------------------------

This is a fully static HTML/CSS/JS version of the Crosera site. You can open it instantly by double-clicking `index.html` in your file browser.

What it includes:
- Fully browsable frontend: hero, featured products, story, care, reviews.
- Cart stored in your browser (localStorage).
- Admin panel accessible with a password (default: motherforever) to add/edit/delete products, change colors, edit About/Care text.
- Image uploads are supported and stored in your browser (data URLs) so previews persist in the same browser on that computer.
- Export/Import JSON feature to back up or move data between machines.
- Checkout and Admin Access Request open your default email client (mailto:) to send the owner (chronoslord54@gmail.com) an email with order or request details. Because this is static, it does NOT send emails automatically.
- All persistent data is stored in the browser's localStorage. Use Export to save a copy to disk.
- No server required.

How to open:
- Double-click `index.html` in the root folder and it will open in your browser.
- If your browser blocks local files or SVG images, try using Chrome/Edge/Firefox stable builds.

Security notes:
- The admin password is stored in the site JS for convenience (you provided it). To change, either export the data and edit the JSON, or edit the JS file before use. For production with real email/order processing, use a server backend (I can help with that).

If you'd like, I can now:
- Zip this static site for you to download (I already created it).
- OR build a true local "double-click starts server + fully-featured backend" package (requires bundling server runtime like Node/PHP/portable binary).

Tell me if you'd like the ZIP download link and whether to include any custom color choices or product images.
