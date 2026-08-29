# Git Guide to Open Source Contributions

## 1. Fork the Source Repo
* Head over to the original project's page on GitHub.
* Click the **Fork** button in the top right corner.
* GitHub will copy the whole thing over to your account.

## 2. Clone to Your Local Machine
* Go to *your* newly forked repo on GitHub and click the green **Code** button.
* Copy the URL provided.
* Open up your terminal/command line and type: `git clone [paste-URL-here]`
* Slide into that new folder by typing: `cd [project-name]`
* *(Pro-bro tip: Create a new branch before coding so you don't mess up the main one! `git checkout -b my-cool-feature`)*

## 3. Commit Your Changes
* Do the changes and save your files.
* Tell Git to track your new stuff: `git add .` (the dot means "add everything").
* Lock it in with a quick message: `git commit -m "added some new features"`
* *Optional: Check the files added with `git status`*

## 4. Sync with the Original Source Repo
* Go to your forked repository, and click on **Sync fork** and then **Update branch**.

## 5. Pull the Latest Changes
* Open a terminal and type: `git pull origin main` (or `git pull origin main --rebase` if faced with some errors).

## 6. Push to Your Forked Repo
* Type: `git push -u origin [your-branch-name]`
* If you just stayed on the main branch, use: `git push -u origin main`.

## 7. Make a Pull Request (PR) 
* Head back to your GitHub profile and open your forked repo.
* You'll see a big, shiny green **Compare & pull request** button. Click it!
* Write a chill description of what you fixed or added.
* Hit submit and wait for the project maintainers to merge your fire code!
