# GitHub Pages Setup Instructions

## Step 1: Enable GitHub Pages

1. Go to: https://github.com/ersinkoc/tonl/settings/pages
2. Under "Source", select: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/website** (or /root if website is at root)
5. Click **Save**

GitHub will automatically deploy your site to:
https://ersinkoc.github.io/tonl

## Step 2: Configure Custom Domain (tonl.dev)

### A. Update GitHub Settings

1. In the same Pages settings
2. Under "Custom domain", enter: **tonl.dev**
3. Click **Save**
4. Wait for DNS check (may take a few minutes)

### B. Configure DNS at Domain Registrar

Add these DNS records at your domain registrar (where you bought tonl.dev):

#### Option 1: A Records (Recommended)
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A  
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

#### Option 2: CNAME Record (Alternative)
```
Type: CNAME
Name: www
Value: ersinkoc.github.io
```

### C. Enable HTTPS

1. After DNS propagates (15 min - 48 hours)
2. In GitHub Pages settings
3. Check ✓ **Enforce HTTPS**
4. GitHub will automatically provision SSL certificate

## Step 3: Verify

After DNS propagates:
- http://tonl.dev → redirects to https://tonl.dev ✅
- https://tonl.dev → Your site loads with green lock ✅

## Current Status

✅ CNAME file created (website/CNAME)
✅ Website files ready
✅ GitHub Actions workflow ready
⏳ Waiting for: GitHub Pages enable + DNS configuration

## Troubleshooting

**If "Enforce HTTPS" shows error:**
- Wait for DNS to fully propagate (up to 48 hours)
- Verify A records are correct
- Check CNAME file contains only: tonl.dev

**If site doesn't load:**
- Check GitHub Actions tab for deployment status
- Verify branch is "main" and folder is "/website"
- Check repository is public or Pages is enabled for private repo

## Documentation

- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
