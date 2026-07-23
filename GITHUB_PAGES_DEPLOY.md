# Deploying Switch job to GitHub Pages

The site is ready to deploy from a repository root. Its navigation does not hard-code a repository name, Windows path, or domain.

## Upload

1. Extract `genai_clean-github-ready.zip`.
2. Upload the extracted files to the root of your GitHub repository. `index.html` must be at the repository root.
3. Commit and push the files to the `main` branch.

## Enable GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder.
5. Save and wait for the deployment to complete.

The site will work at a project URL such as:

`https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`

The included `.nojekyll` file keeps GitHub Pages in plain static-site mode.
