# **Tickly App \- Official Design System (v3)**

## **1\. Core Philosophy**

This design system provides a unified set of principles and components to build a beautiful, consistent, and user-friendly experience for the Tickly application. Our goal is to create an interface that is **energetic, clear, and trustworthy**.

**Principles:**

* **Clarity First:** The user journey, from discovering an event to purchasing a ticket, must be effortless and intuitive.
* **Vibrant & Dynamic:** The UI should feel alive and exciting, reflecting the energy of live events. We achieve this through a bold color palette, modern typography, and meaningful motion.
* **Consistency is Key:** Every component, from a button to a dialog box, must look and behave predictably across the platform. This builds trust and reduces cognitive load.
* **Performance:** A fast and responsive interface is a core part of the user experience.

## **2\. UI Frameworks**

* **Angular Material:** The primary component library for all interactive elements (buttons, forms, dialogs, etc.) to ensure accessibility and a solid foundation.
* **Bootstrap:** Used **only** for its responsive layout grid system (container, row, col) and for the main application **Navbar** (.navbar, .navbar-collapse). **Do not use other Bootstrap components.**

## **3\. Typography**

We are using **Inter** for its excellent readability on screens and its modern, neutral aesthetic.

* **Font Family:** Inter, sans-serif
* **Import:** Import weights 400, 500, 600, and 700 from Google Fonts in your index.html.
* **Base Size:** 16px on desktop, 15px on mobile.

### **Typographic Scale**

| Role | Font Weight | Font Size (Desktop/Mobile) | Letter Spacing | Use Case |
| :---- | :---- | :---- | :---- | :---- |
| **Display** | 700 (Bold) | 48px / 36px | \-0.5px | Hero section titles, major headings. |
| **Heading 1** | 700 (Bold) | 32px / 28px | \-0.25px | Main page titles (\<h1\>). |
| **Heading 2** | 600 (SemiBold) | 24px / 22px | 0px | Section titles (\<h2\>). |
| **Heading 3** | 600 (SemiBold) | 20px / 18px | 0px | Sub-section titles (\<h3\>). |
| **Body (Large)** | 400 (Regular) | 18px / 17px | 0px | Emphasized body text, intros. |
| **Body (Default)** | 400 (Regular) | 16px / 15px | 0px | Main paragraph and component text. |
| **Body (Small)** | 400 (Regular) | 14px / 13px | 0.1px | Secondary text, metadata, captions. |
| **Button** | 500 (Medium) | 14px / 14px | 0.25px | All button labels. |
| **Label** | 500 (Medium) | 12px / 12px | 0.5px | Small labels, tags, uppercase text. |

## **4\. Color Palette**

### **4.1. Core Palette**

This is the main palette for the application's UI.

| Role | Color | Code HEX | CSS Variable | Usage |
| :---- | :---- | :---- | :---- | :---- |
| **Primary** | Vibrant Violet | \#5A48F5 | \--primary | Main brand color for headers, primary buttons, and active states. |
| **Accent** | Mango | \#FFAA00 | \--accent | Call-to-actions (CTAs), highlights, links, and interactive form elements. |
| **Primary Gradient** | Magic Hour | linear-gradient(to right, \#6E5AF7, \#5A48F5) | \--primary-gradient | Used on primary buttons and hero sections for a dynamic feel. |

### **4.2. Supplementary Palettes**

These palettes can be used for specific themes, event categories, or promotional content to add variety.

Sunset Palette (Warm & Energetic)  
| Role | Color | Code HEX | CSS Variable |  
| :--- | :--- | :--- | :--- |  
| Sunset Orange | | \#FF7043 | \--sunset-orange |  
| Sunset Red | | \#F44336 | \--sunset-red |  
Twilight Palette (Deep & Cool)  
| Role | Color | Code HEX | CSS Variable |  
| :--- | :--- | :--- | :--- |  
| Twilight Purple| | \#7E57C2 | \--twilight-purple |  
| Twilight Blue | | \#29B6F6 | \--twilight-blue |

### **4.3. Neutral & System Tones**

| Role | Color | Code HEX | CSS Variable | Usage |
| :---- | :---- | :---- | :---- | :---- |
| **Text Primary** | Onyx | \#1A1A1A | \--text-primary | Main text, headings. |
| **Text Secondary** | Medium Gray | \#666666 | \--text-secondary | Subtitles, descriptions, disabled text. |
| **Surface** | White | \#FFFFFF | \--surface | Card backgrounds, dialogs, menus. |
| **Background** | Light Gray | \#F8F9FA | \--background | Main application background. |
| **Border** | Subtle Gray | \#EAECEF | \--border | Borders for cards, inputs, and dividers. |
| **Success** | Green | \#28A745 | \--success | Success messages, confirmations. |
| **Error** | Red | \#DC3545 | \--error | Error messages, destructive actions. |
| **Warning** | Yellow | \#FFC107 | \--warning | Non-critical warnings. |

## **5\. Spacing & Sizing**

* **Base Unit:** 8px. All margins, paddings, and layout gaps should be multiples of 8\.
* **Border Radius:**
  * \--border-radius-small: 4px; (for tags, small elements)
  * \--border-radius-medium: 8px; (for buttons, inputs, cards)
  * \--border-radius-large: 16px; (for dialogs, larger containers)

## **6\. Elevation & Shadows**

* **\--shadow-sm (Subtle):** 0 2px 4px rgba(0,0,0,0.05)
* **\--shadow-md (Interactive):** 0 4px 12px rgba(0,0,0,0.1)
* **\--shadow-lg (Elevated):** 0 8px 24px rgba(0,0,0,0.15)

## **7\. Component Styling**

### **7.1. Buttons (mat-button)**

This need to be adapted depending on the context, don't change custom buttons if any :

* **Primary (CTA):** mat-raised-button with color="primary". Apply \--primary-gradient.
* **Secondary:** mat-stroked-button with color="primary".
* **Tertiary/Text:** mat-button with color="accent".
* 

### **7.2. Cards (mat-card)**

* **Padding:** 24px.
* **Border:** 1px solid var(--border).
* **Border Radius:** var(--border-radius-medium).
* **Shadow:** var(--shadow-sm), transitioning to var(--shadow-md) on hover.

### **7.3. Bootstrap Navbar Integration**

The main application navbar uses Bootstrap's classes. It is the **only** Bootstrap component that should be used. To ensure it matches our design system, it must be styled using our theme variables.

* **Background:** The .navbar should use var(--surface) for its background color.
* **Text & Links:** Navbar links (.nav-link) should use var(--text-secondary) by default, and var(--primary) for the active/hover state.
* **Brand:** The .navbar-brand logo/text should be prominent.
* **Shadow:** Apply var(--shadow-sm) to give it slight elevation.
* **Implementation:** Specific SCSS overrides are provided in \_theme.scss to handle this integration automatically.
