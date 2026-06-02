# Register Interest Anchor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable direct linking to the registration modal via `#register-interest` hash

**Architecture:** Add an anchor ID to the social proof section and implement hash detection on page load. Browser's native scroll handles navigation; JavaScript opens modal when hash matches.

**Tech Stack:** Vanilla JavaScript, HTML5

---

## File Structure

**Modified:**
- `deploy/index.html` - Add anchor ID and hash detection script

**Testing:**
- Manual browser testing with hash URLs

---

### Task 1: Add Anchor ID to Social Proof Section

**Files:**
- Modify: `deploy/index.html:1004`

- [ ] **Step 1: Add ID attribute to social proof section**

Add `id="register-interest"` to the opening `<section>` tag:

```html
<section id="register-interest" class="social-proof bg-lifted" data-section="social-proof" data-intent="build trust" data-layout="contained">
```

- [ ] **Step 2: Verify the change**

Run: `grep -n 'id="register-interest"' deploy/index.html`

Expected: Line number and the modified section tag

- [ ] **Step 3: Test anchor navigation**

1. Open `deploy/index.html` in browser
2. Navigate to `file:///.../deploy/index.html#register-interest`
3. Expected: Page scrolls to the "Early Access" section
4. Expected: Section with "Built for the brands..." heading is visible

- [ ] **Step 4: Commit anchor ID**

```bash
git add deploy/index.html
git commit -m "Add anchor ID to register interest section"
```

---

### Task 2: Add Hash Detection Script

**Files:**
- Modify: `deploy/index.html:1096-1097`

- [ ] **Step 1: Add hash detection logic**

After the existing `closeInterestModal` event listener (after line 1096), add the hash detection code before the `submitInterest` function:

```javascript
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeInterestModal();
  });
  
  // Auto-open modal when hash is #register-interest
  if (window.location.hash === '#register-interest') {
    openInterestModal();
  }
  
  async function submitInterest(e) {
```

- [ ] **Step 2: Verify the script location**

Run: `grep -A 2 "window.location.hash" deploy/index.html`

Expected: Shows the hash detection code in the script section

- [ ] **Step 3: Test hash-triggered modal open**

1. Close any open browser tabs with the page
2. Open fresh: `file:///.../deploy/index.html#register-interest`
3. Expected: Page scrolls to "Early Access" section
4. Expected: Registration modal opens automatically
5. Expected: Form is visible with "Register your interest" heading

- [ ] **Step 4: Test normal modal behavior still works**

1. Close the modal (X button)
2. Click "Register interest" button in the Early Access section
3. Expected: Modal opens normally
4. Close modal and reload page without hash: `file:///.../deploy/index.html`
5. Expected: Page loads normally, modal does not auto-open

- [ ] **Step 5: Test edge cases**

1. Open `file:///.../deploy/index.html#register-interest`
2. Close modal with X button
3. Expected: Modal closes, can still reopen with button
4. With modal open, click backdrop (outside modal)
5. Expected: Modal closes
6. With modal open, press Escape key
7. Expected: Modal closes

- [ ] **Step 6: Commit hash detection**

```bash
git add deploy/index.html
git commit -m "Add auto-open modal on #register-interest hash"
```

---

### Task 3: Final Verification

**Files:**
- Test: `deploy/index.html`

- [ ] **Step 1: Test complete flow**

1. Open: `file:///.../deploy/index.html#register-interest`
2. Verify page scrolls to Early Access section
3. Verify modal opens automatically
4. Verify form fields are present (Name, Email, Message)
5. Close modal
6. Verify button click still opens modal
7. Reload page without hash
8. Verify modal does not auto-open

- [ ] **Step 2: Test on different browsers (if available)**

Test on Chrome, Firefox, or Safari:
1. Open: `file:///.../deploy/index.html#register-interest`
2. Expected: Consistent behavior across browsers

- [ ] **Step 3: Verify git status**

Run: `git status`

Expected: "working tree clean" (all changes committed)

Run: `git log --oneline -2`

Expected: Shows the two commits from Task 1 and Task 2

---

## Self-Review Checklist

✓ **Spec coverage:**
- ✓ Add anchor ID to section (Task 1)
- ✓ Page scrolls to section with hash (Task 1, Step 3)
- ✓ Modal opens automatically with hash (Task 2, Step 3)
- ✓ No changes to manual button functionality (Task 2, Step 4)

✓ **Placeholder scan:** No TBD/TODO/placeholders present

✓ **Type consistency:** All function names match existing code (`openInterestModal`, `closeInterestModal`)

✓ **File paths:** All exact and absolute

✓ **Commands:** All include expected output
