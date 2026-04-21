# Noosa Tax &amp; Accounting — website

Static marketing site for Noosa Tax &amp; Accounting, a boutique CPA firm in
Columbus, Ohio. Designed to be hosted from any static web host with zero build
step — open the files in a browser and they work.

## Stack

- Plain, hand-written HTML / CSS / JS
- Two webfonts loaded from Google Fonts (Fraunces display, Inter body)
- No framework, no build, no npm dependencies
- ~15&nbsp;KB of CSS, &lt;2&nbsp;KB of JS, ~10&nbsp;MB of images

## File layout

```
.
├── index.html           # Home
├── services.html        # Services + pricing + FAQ
├── staff.html           # Founder / team
├── contact.html         # Contact info + form
├── 404.html             # Used by S3 and GitHub Pages
├── sitemap.xml
├── robots.txt
├── .nojekyll            # Tell GitHub Pages to serve files as-is
└── assets/
    ├── css/styles.css
    ├── js/site.js
    └── images/          # logo, favicon, banner, team photos
```

## Local preview

```bash
python3 -m http.server 4747
open http://localhost:4747/
```

Or use any static server (`npx serve`, `caddy file-server`, etc.).

---

## Deployment — GitHub Pages

This repo is configured for GitHub Pages out of the box.

1. Push to a GitHub repo (already done if you're reading this in one).
2. In the repo: **Settings → Pages → Source → Deploy from a branch → `main` / `/` (root)**.
3. Pages builds within a minute. The URL is
   `https://<user>.github.io/<repo>/`.

The `.nojekyll` file prevents Jekyll from mangling anything.

### CLI version

```bash
gh api -X POST /repos/:owner/:repo/pages \
  -f source.branch=main -f source.path=/
gh api /repos/:owner/:repo/pages | jq -r '.html_url'
```

---

## Deployment — Amazon S3 + CloudFront

Every path in this site is root-relative, `index.html` is at the bucket root,
and `404.html` is top-level — so S3 static hosting works with no rewrites.

```bash
# 1. Create the bucket (must be globally unique)
aws s3api create-bucket \
  --bucket noosa-tax-website \
  --region us-east-1

# 2. Disable "block public access" for this bucket, then attach a read-only policy
aws s3api put-public-access-block \
  --bucket noosa-tax-website \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

aws s3api put-bucket-policy --bucket noosa-tax-website --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::noosa-tax-website/*"
  }]
}'

# 3. Turn on static website hosting
aws s3 website s3://noosa-tax-website/ \
  --index-document index.html \
  --error-document 404.html

# 4. Sync this repo to the bucket
aws s3 sync . s3://noosa-tax-website \
  --exclude ".git/*" --exclude ".github/*" --exclude "README.md" \
  --exclude ".gitignore" --exclude ".DS_Store" \
  --delete \
  --cache-control "public, max-age=3600"

# 5. (Recommended) Put CloudFront in front for HTTPS + custom domain
#    — Origin: the S3 website endpoint (NOT the REST endpoint)
#    — Default root object: index.html
#    — Custom error responses: 403 &amp; 404 → /404.html, 404
```

The site endpoint is now available at
`http://noosa-tax-website.s3-website-us-east-1.amazonaws.com`. For a custom
domain and HTTPS, attach CloudFront + Route 53 + ACM.

### Cache strategy note

The `aws s3 sync` above sets a one-hour `Cache-Control`, which is safe for
content that changes occasionally. If you hash/version asset filenames later
you can bump this to a year for everything under `assets/`.

---

## Credits

- Brand mark, team photography and tone of voice belong to Noosa Tax &amp;
  Accounting.
- Typography: [Fraunces](https://fonts.google.com/specimen/Fraunces) +
  [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts.
