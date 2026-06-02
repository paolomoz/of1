# Register Interest Anchor Design

**Date:** 2026-05-04  
**Status:** Approved  
**Scope:** Add anchor link functionality to the "Register your interest" section

## Overview

Enable direct linking to the registration modal via `#register-interest` hash. When users visit the URL with this hash, the page will scroll to the "Early Access" section and automatically open the registration modal.

## Requirements

- Users can share/bookmark a direct link that opens the registration modal
- Page must scroll to the relevant section when hash is present
- Modal must open automatically when hash is present
- No changes to existing modal functionality (manual button clicks)
- Minimal code addition, leveraging browser's native scroll behavior

## Implementation

### 1. Add Anchor ID

Add `id="register-interest"` to the social proof section:

**File:** `deploy/index.html`  
**Line:** 1004  
**Change:** Add ID attribute to the section element

```html
<section id="register-interest" class="social-proof bg-lifted" ...>
```

### 2. Hash Detection Script

Add hash detection logic after existing modal scripts (after line 1096, before closing `</script>` tag):

```javascript
// Auto-open modal when hash is #register-interest
if (window.location.hash === '#register-interest') {
  openInterestModal();
}
```

## Behavior

**Direct link navigation (`#register-interest`):**
1. Browser navigates to URL with hash
2. Browser automatically scrolls to section with matching ID
3. Page loads and executes hash detection script
4. Script detects hash and calls `openInterestModal()`
5. Modal opens over the scrolled-to section

**Manual button click:**
- No change to existing behavior
- Button click opens modal, no URL change

## Technical Notes

- Browser's native hash scroll behavior ensures the section is visible before modal opens
- No timing coordination needed between scroll and modal open
- No conflicts with existing modal functionality
- Script executes after DOM load, ensuring `openInterestModal()` function is available

## Edge Cases

- If hash is present but user closes modal, they can reopen via button
- If user navigates away and back (browser back button), modal does not reopen (hash detection only runs on page load)
- Hash scroll happens before JavaScript executes, so section is always in view

## Files Modified

1. `deploy/index.html` (2 changes)
   - Add `id="register-interest"` to social proof section
   - Add hash detection script
