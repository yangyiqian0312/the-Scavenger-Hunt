# the-Scavenger-Hunt

## Codex PR workflow note

If you see a message like "Codex currently can't update a pull request that was changed outside of Codex," it means the existing PR branch/history is no longer in the state Codex expects.

Common causes:
- The PR was edited directly on GitHub.
- Extra commits were pushed manually from another environment.
- The branch was rebased/force-pushed outside this Codex session.

In that case, create a **new PR** from the current branch head so Codex can continue with a clean, consistent patch history.

## If "Update branch" fails on GitHub

When you click **Update branch** and see this error, use one of these recovery paths:

1. **Safest (recommended): create a new PR**
   - Keep your latest commits on the current branch.
   - Open a fresh PR to the same base branch.
   - Close the broken PR.

2. **CLI fix (if you want to keep the same PR)**
   - Sync target branch and rebase/merge locally.
   - Resolve conflicts locally.
   - Push the updated branch.

Example commands:

```bash
git fetch origin
git checkout <your-branch>
git rebase origin/main
# resolve conflicts if prompted
git push --force-with-lease
```

If your team does not allow force-push, use merge instead:

```bash
git fetch origin
git checkout <your-branch>
git merge origin/main
git push
```
