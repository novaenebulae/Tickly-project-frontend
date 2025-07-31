- User Tickets page
- User Tickets modal
- Structure details page
- Structure banner
- Structure events


#### Event details page : 
- Event banner : content are overflowing, content is not well formatted, infos inside banner should be displayed in columns, event title is not visible.
- Structure logo in infos section is overlapping on text and structure types chips
- Similar events : 3 events are always displayed, so it does not work in mobile view. Should be 1 or 2 on mobile

Team management design errors
Event form : step completed error on media + configuration panels

#### Page header with errors :

- Team management
- Structure Medias
- Structure areas
- Events panel
- Events calendar
- Event form


### Landing page responsive errors : 
- Event carousel controls overflowing (hide controls on responsive and make the carousel slideable by touch).
- Margin is created on the right because of an overflowing element.
- Top + bottom margin around event carousel too big on responsive.

### Navbar component : 
- Place the user dropdown menu outside the burger menu, on the left of the burger menu trigger
- Login + register button should be placed on the bottom of the navigation links

- Section title designs (impactful, colorful, animated)
- Discovery section cards buttons: smaller width, colorful, animated.
- Modify section backgrounds to use consistent textures and colors to help differentiate transitions between sections.
Use https://www.fffuel.co/wwwatercolor/ to generate colorful and creative textures. Do not use existing texture located in `public`, create new ones.

- Favorite structures header


### Event filters (on mobile view) : 
- Advanced filters and sort by have to be on the same line. Search bar on top.
- Chips design rework
- Period and Location form input are shifted on the right + text overflow on mat icon
- Vertical Margin are too big on period and location form input

### Paginator (all view) :
- Design paginator (add color, more colorful design)
- Adapt for responsive view



### All structure page : 

- Paginator design (same design as paginator in `src/app/pages/public/events/all-events-page`component)

#### Structure filters `src/app/shared/domain/structures/structure-filters` :
- Check and fix responsive design issues
- Overall placement of elements is not well designed on mobile view.

#### Structure cards `src/app/shared/domain/structures/structure-card` :
- Actions buttons need to be on same row on mobile view.
- Structure logos are overflowing on long structure names.
- Structure types chips colorful design.


1. Check `src/app/pages/public/events/all-events-page` component.
2. Check children components :
- `src/app/shared/domain/events/events-filters`
- `src/app/shared/domain/events/events-display`

3. Apply these modifications :

### Event filters (on mobile view) :
- 'Advanced filters' and 'sort by' buttons have to be on the same line. Search bar on top.
- Event types chips design rework
- Period and Location form input are shifted on the right + text overflow on mat icon
- Vertical Margin are too big on period and location form input

### Paginator (all view) :
- Design paginator : more colorful design, more visually appealing.
- Adapt for responsive view (everything on same row)

Use `src/styles/_theme.scss` for consistent design.

4. Check for design errors, if any fix them.

5. Wait for feedback when all the modifications are done.


