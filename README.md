# Cupid Pudding Frontend

Frontend application for Cupid Pudding - A matchmaking-style promotional website.

## Deployment on Vercel

### Prerequisites

- GitHub/GitLab account
- Vercel account (free tier)

### Steps to Deploy

1. **Push frontend folder to a Git repository**

   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial frontend commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your frontend repository
   - Configure:
     - **Framework Preset**: Other (static site)
     - **Root Directory**: Leave as is
     - **Build Command**: Leave empty (no build needed)
     - **Output Directory**: `public`

3. **Update API URL**
   After deploying backend on Render, update the API URL:
   - Open `public/js/config.js`
   - Replace `https://your-backend-app.onrender.com/api` with your actual Render backend URL
   - Commit and push the change

### Local Development

**Option 1: VS Code Live Server (Recommended)**

1. Install "Live Server" extension in VS Code
2. Right-click on `public/index.html`
3. Select "Open with Live Server"
4. Opens at `http://localhost:5500`

**Option 2: Python HTTP Server**

```bash
cd frontend/public
python3 -m http.server 8000
```

Visit `http://localhost:8000`

**Option 3: Any Static File Server**

```bash
cd frontend/public
npx serve
```

The frontend is pure HTML/CSS/JavaScript with ES6 modules - no build step needed!

### Project Structure

```
frontend/
├── public/
│   ├── index.html          # Main page
│   ├── matching.html       # Matching animation page
│   ├── result.html         # Result display page
│   ├── receipt.html        # Receipt page
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── config.js       # API configuration (UPDATE THIS)
│   │   ├── main.js
│   │   ├── matching.js
│   │   ├── receipt.js
│   │   └── result.js
│   ├── assets/
│   └── stickers/
├── vercel.json             # Vercel configuration
└── package.json
```

### Important Notes

- Make sure to update `config.js` with your backend API URL after deploying to Render
- All API calls automatically switch between localhost (development) and production URLs
- Vercel serves static files instantly with no cold start delays

### Custom Domain (Optional)

In Vercel dashboard:

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
