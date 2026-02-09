# Forum Design and User Flow Enhancement Proposal for SA Racing Forum

This proposal reviews the existing SA Racing Forum (forums-app-next-js.vercel.app) and recommends design, layout and user-flow changes to improve usability and discovery. It draws on best-practice guidance for online communities and UI/UX design. Citations are provided for reference.

## 1. Global Navigation & Information Architecture

### 1.1 Header navigation

Current: The top navigation shows textual links (Forum, Categories, Newsletter, Notifications, Profile/Login). When the user logs in they are redirected to the profile page and must navigate back to the forum manually. The logged-in state is not visually distinct and there is no direct “new thread” button from the main forum.

**Problems**

- Lack of immediate context on whether the user is signed in.
- After signing in or signing up, users are sent to the profile page rather than the page they were trying to access. This breaks task flow.
- The absence of a global “new thread” CTA means users must drill down into a category before they can create a thread.
- Navigation links are plain text without icons or visual grouping, making it harder to scan.

**Recommendations**

- **User avatar & menu** – Replace the Profile text link with a user avatar and dropdown menu when signed in. The avatar can display the user’s initials or profile image. The dropdown should include links to My Profile, My Threads, Notifications, Settings and Logout. This visually communicates the logged-in state and declutters the navigation bar.
- **Persistent new-thread button** – Add a prominent New Thread button to the header. When clicked it opens a modal or dedicated page with a thread-creation form. The category can default to General but users should be able to select another category via a dropdown. This reduces friction because users no longer need to navigate into a category first.
- **Intelligent redirect after login/sign-up** – Store the intended destination (e.g. thread page, thread creation page) in local storage or a query parameter when a guest is prompted to log in. After authentication, redirect the user back to that destination. If they simply clicked Login from the navigation bar, redirect them to the forum homepage. This aligns with user-expectation guidelines for online communities[1].
- **Visual grouping and icons** – Group related links (e.g. Forum & Categories, Newsletter, Notifications) and pair them with intuitive icons. This improves scanability and reduces cognitive load. Use a consistent icon style (e.g. Material Icons).

### 1.2 Categories & forum structure

Current: Categories are presented as cards with a title, a short description and a Browse threads link. The main forum page lists all threads across categories with filters (category dropdown, search input and sort order). Quick links to categories appear in a vertical list on the left.

**Recommendations**

- **Home page / dashboard** – Adopt a dual-state home page as suggested by UX best practices[1]:
  - **Guest users:** show a welcome message describing the community, the top categories, a few featured or pinned threads, and CTAs to Sign up or Log in. This answers the visitor’s question, “Should I stay?”[2].
  - **Logged-in users:** show a personalized dashboard with an activity feed (latest threads and replies from categories they follow), quick access to threads they’ve created or replied to, and notifications. Activity feeds are recommended for community sites because they surface recent activity and encourage engagement[3].
- **Category page improvements** – The category cards currently have a lot of white space, but the Browse threads link is small. Make the entire card clickable (with a hover effect) so users can open the category by clicking anywhere. Add an optional icon or image for each category to provide visual differentiation. Include a badge showing the number of threads.
- **Filtering and sorting** – Retain the left-hand filter component but make it collapsible on smaller screens. Use a design system (e.g. Tailwind’s forms) to ensure consistent spacing and contrast[4]. When the user chooses a category from the filter, update the thread list without reloading the page (client-side filtering). Provide more sort options such as Most recent reply (latest activity), Most replies (most popular) and Newest threads (current default). Sorting by recent activity surfaces threads with new replies, addressing the requirement that active threads move up automatically.
- **Breadcrumbs** – Add a breadcrumb trail (e.g. Home / Categories / Karting Discussions / Thread title) near the top of thread pages to help users orient themselves and navigate back. Clear navigation cues are critical for community sites[5].

## 2. Thread Page Layout

Current: The thread page displays the thread details at the top but immediately follows with large “Report thread” and “Edit your thread” forms. Replies appear below with each reply followed by a full Report reply reason form. The heavy emphasis on reporting and editing distracts from reading and replying. Additionally, to post a reply the user must scroll past these forms.

**Recommendations**

- **Reorder page sections** – Structure the thread page in the following order:
  - **Thread header:** title, category tag, author with avatar, timestamp, and Status badge (e.g. open/closed). Display a short description or excerpt.
  - **Thread actions:** show subtle action buttons – Edit (only for thread owner/admin), Delete (owner/admin), Report thread (a small link or flag icon), and Follow/Unfollow. Place these buttons horizontally below the header or in a three-dot menu to reduce clutter.
  - **Body:** Render the full body of the thread in a readable font size with ample line height and whitespace. Support rich-text formatting (headings, lists, code blocks) and media embedding. Including a rich-text editor helps contributors create well-structured posts[6].
  - **Replies:** display replies below the thread body in chronological or nested order. Each reply should show the responder’s avatar, name, timestamp and reply content. Provide a small Reply link next to each reply for quoting or nested replies. A small flag icon can trigger a modal for reporting that reply. Do not show the full Report reason form inline; it should open in a modal or off-canvas panel to avoid clutter.
  - **Reply form:** place a clearly labeled Add a reply section after the list of replies. Use a multi-row textarea or rich-text editor and buttons for Post reply and Preview. Inline guidelines can remind users of community rules.
- **Nested vs flat replies** – For small threads, display replies in a flat list sorted by posting time or most recent activity. For longer or branched discussions, consider a collapsible nested structure (using indentation) with a “show context” link next to each reply to view the parent comment. This approach balances clarity and context, similar to suggestions on handling threaded discussions[7].
- **Visual hierarchy & whitespace** – Use cards with subtle shadows for thread and reply containers to separate content from the background. Increase line height and padding to improve readability. A minimalist design with plenty of white space and a few key actions reduces cognitive load, improving completion rates[4].
- **Responsive design** – Ensure the thread page adapts gracefully to mobile screens. For example, collapse actions into menus, hide avatars behind initials at small widths and enable infinite scrolling or pagination for replies. According to UI/UX best practices, designing mobile-first ensures responsiveness across devices[8].

## 3. Forms & Contribution Flow

Current: The thread creation form and reply form are basic; they accept plain text and optional image uploads. The thread creation page pushes the Publish thread button to the very bottom, which can be hard to find. When users attempt to create a thread or reply while not signed in, they are redirected to the login page but not returned to their previous action afterwards.

**Recommendations**

- **Rich-text editor** – Incorporate a WYSIWYG editor or markdown editor with buttons for headings, bold/italic, links, lists, blockquotes and code. This encourages structured, readable posts and fosters higher-quality content[6]. Provide a preview tab.
- **Inline validation** – Use placeholder examples and character counters in the title/body fields. Provide immediate validation (e.g. minimum title length) and disable the Publish thread button until requirements are met. Keep the primary action button visible without requiring extensive scrolling; consider placing it both above and below the form, or making it sticky at the bottom of the viewport.
- **Autosave drafts** – Implement auto-saving for threads and replies to prevent data loss if the user navigates away. Drafts can be stored in local storage and resumed later.
- **Attachment preview** – When images are selected, display thumbnails with file size and an option to remove. Explain the allowed formats clearly near the file chooser.
- **Login/register modals** – When a guest tries to start a thread or reply, show a modal prompting them to log in or sign up, rather than navigating away. The modal should overlay the current page and, upon successful authentication, allow the user to continue the action without losing their input. This “effortless contribution” principle reduces drop-off[6].

## 4. Notifications & User Activity

Current: Notifications are presented as two simple cards with “Open thread” and “Mark read”. The number of unread notifications is shown as a badge in the navigation bar. There is no user dashboard summarizing recent activity.

**Recommendations**

- **Notifications dropdown** – Replace the text Notifications in the header with a bell icon showing the unread count. Clicking the bell opens a dropdown with the latest notifications (title, timestamp and a snippet). This allows quick scanning without leaving the current page. Include Mark all as read at the bottom.
- **Persistent notifications page** – Keep the current notifications page for users who want to review their history. Group notifications by date and add filters (e.g. unread, replies to my threads, mentions). Provide pagination or infinite scroll if there are many notifications.
- **Activity feed in profile** – Add a tab on the profile page showing the user’s recent activity: threads created, replies posted, likes received and threads followed. This helps users find their contributions quickly.

## 5. Visual Design & Branding

To elevate the look and feel of the SA Racing Forum and align with current UI/UX trends, consider the following design choices:

- **Color palette** – Maintain a motorsport theme by using navy or royal blue as the primary accent (currently used) and introduce complementary colors like bright orange or lime green for highlights (buttons, badges). Ensure sufficient contrast ratios (WCAG 2.1 recommends at least 4.5:1 for normal text[9]). Use a soft off-white (#F5F7FA) or very light grey background to make the content cards stand out.
- **Typography** – Use a modern sans-serif font such as Inter or Roboto for body text and Montserrat for headings. Increase line height (~1.6) and font size (16–18 px) to improve readability[2]. Avoid mixing too many fonts; consistency builds trust[10].
- **Shadows & elevation** – Apply subtle shadows or borders to cards and forms to create layers. Keep the UI minimalist with clean lines and avoid unnecessary decorative elements. This aligns with guidelines recommending clean layouts and plenty of white space[4].
- **Icons & imagery** – Use icons for actions (edit, delete, reply, report, follow) to reduce textual clutter and improve scanning. Use high-quality images or illustrations for newsletters and category banners to add visual interest.
- **Dark mode** – Offer a dark mode toggle in the user settings. Use design tokens to manage colors for both light and dark themes. Many users browse forums at night, and a dark mode improves comfort.

## 6. Accessibility Considerations

- Ensure all interactive elements have sufficient contrast and visible focus states.
- Support keyboard navigation throughout the site (tab order, skip links). Use semantic HTML for headings and lists so assistive technologies can parse the structure.
- Provide aria-labels on icons and meaningful alt text for images.
- Avoid time-dependent pop-ups; any modals must be accessible via keyboard and screen readers.

## 7. Summary of Key User-Flow Improvements

| Issue | Proposed Improvement |
| --- | --- |
| Login flow disrupts user task | Capture the user’s intended destination and redirect them back post-login; use modal login when starting a thread or reply. |
| No global “new thread” CTA | Add a persistent New Thread button in the header with a modal/thread page that includes category selection. |
| Thread page cluttered by report/edit forms | Move report/edit actions to smaller links or a dropdown; show reply form immediately below replies; open report forms in a modal. |
| Editing and deletion options visible to all | Conditionally render Edit and Delete only for thread author or admins to avoid confusion. |
| Threads not sorted by latest activity | Provide sort option “Most recent activity” and update the list when a new reply is posted. Consider using a real-time feed to automatically move active threads up. |
| Limited search/filtering | Implement faceted search with filters for category, keyword, author, date range and popularity. |
| Newsletter & notifications lacking integration | Link newsletter entries directly to forum discussions; provide notifications dropdown and activity feed. |

By implementing these recommendations, the SA Racing Forum will offer a more intuitive, visually pleasing and engaging experience for both casual visitors and active members. The improved navigation, clear hierarchy, thoughtful placement of CTAs, and adherence to UX best practices[4][2] will encourage greater participation and retention.

[1] [2] [3] [5] [6] Seven UX Best Practices of Community Design - UX Magazine  
https://uxmag.com/articles/seven-ux-best-practices-of-community-design

[4] [8] [9] [10] How to Dominate Web App UI/UX in 2025? Best Practices and Trends - Orthoplex Solutions  
https://orthoplexsolutions.com/web-development/web-app-ui-ux-best-practices-and-trends-in-2025-for-optimal-user-experience/

[7] gui design - A better way to display a forum thread - User Experience Stack Exchange  
https://ux.stackexchange.com/questions/19879/a-better-way-to-display-a-forum-thread
