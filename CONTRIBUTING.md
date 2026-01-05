# Contributing to Flight Booking Service

Thank you for contributing to the Flight Booking Service project!

## Setting Up Your Git Configuration

To ensure your commits are properly attributed to you and appear in your GitHub contribution graph, please follow these steps:

### 1. Verify Your Git Email Configuration

Before making commits, verify that your git email is correctly configured:

```bash
git config user.email
git config user.name
```

### 2. Set the Correct Email Address

If your email is incorrect or not set, configure it with the email associated with your GitHub account:

```bash
# For this repository only (recommended)
git config user.email "your.email@gmail.com"
git config user.name "Your Name"

# Or globally for all repositories
git config --global user.email "your.email@gmail.com"
git config --global user.name "Your Name"
```

**Important:** Make sure there are no typos in your email address. The email must exactly match one of the verified emails in your GitHub account settings.

### 3. Verify Your GitHub Email Settings

1. Go to GitHub Settings: https://github.com/settings/emails
2. Make sure your email is listed and verified
3. Optionally, check "Keep my email addresses private" if you prefer

## Why Your Commits Might Not Show in GitHub Contribution Graph

GitHub only counts commits in your contribution graph when:

1. **Email Match**: The email address in your commit matches a verified email in your GitHub account
2. **Repository Ownership**: The repository is not a fork (or the commit is merged to the parent)
3. **Branch**: The commit is in the default branch (usually `main` or `master`)
4. **Commit Date**: The commit was made within the last year
5. **Your Account**: You're the commit author, not just the committer

### Common Issues

#### Issue: Typo in Email Address
**Problem**: Email in commits has a typo (e.g., "gmial.com" instead of "gmail.com")  
**Solution**: 
- Fix your git config for future commits (see step 2 above)
- The `.mailmap` file in this repository helps map historical typos to the correct email

#### Issue: Email Not Verified on GitHub
**Problem**: The email in your commits isn't verified on GitHub  
**Solution**: 
1. Go to https://github.com/settings/emails
2. Add your email if it's not there
3. Verify it by clicking the link in the confirmation email

#### Issue: Commits in Wrong Branch
**Problem**: Commits are in a feature branch, not the default branch  
**Solution**: 
- Merge your PR to the main branch
- GitHub only counts commits in the default branch (with some exceptions)

## Making Your First Commit

1. Make your changes
2. Stage the changes: `git add .`
3. Commit with a clear message: `git commit -m "feat: add new feature"`
4. Push to your branch: `git push origin your-branch-name`

## Commit Message Guidelines

Use conventional commit format:
- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: add booking cancellation endpoint`

## Need Help?

If you're still having issues with your GitHub contribution graph after following these steps:
1. Double-check your git email configuration
2. Verify your email on GitHub
3. Ensure your commits are in the default branch
4. Check if the repository is properly configured

For more information, see [GitHub's guide on contribution graphs](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/why-are-my-contributions-not-showing-up-on-my-profile).
