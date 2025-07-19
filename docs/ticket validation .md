The ticket validation feature has to be included.
Structure staff should be able to validate tickets from a panel reachable from the EventDetailPanel component in `src/app/pages/private/admin/panels/events/event-details-panel`

This button should open a new panel in admin layout showing all the tickets reserved for the event in a paginated mat tab, with basic filters by status, and a search bar to get a specific ticket (by firstname, lastname, mail or uuid...)

All infos related to the tickets (status, spectator info, uuid, etc) has to bee displayed on rows.
The individual ticket can be validated with an action button on the ticket row.

The component has to be updated in a constant rate when the event is taking place, so the data shown is 'real time' (for example a 5 second rate), needing the use of a websocket (with Socket.IO and RxJS)

The component should also include some datas showing the actual fill rate in the event, number of tickets scanned...

The data relative to the ticket validation, ticket searching and ticket paginated response can be found in ***

The panel design should be coherent with the other admin components.

Tests has to be run for checking that everything is working. 

