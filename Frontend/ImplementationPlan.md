Reservation Modal Implementation
Goal Description
Create a comprehensive reservation modal that appears when users click "Ver Calendario" on any room or equipment card. The modal will feature:

Monthly calendar view showing available dates
Equipment selection for additional items
Duration/time slot selection
Reservation confirmation
Proposed Changes
Directory Structure (src/features/reservations)
components/:
ReservationModal.jsx: Main modal container with overlay
Calendar.jsx: Monthly calendar with date selection
EquipmentSelector.jsx: Checkbox list for additional equipment
DurationSelector.jsx: Time slot and duration picker
ReservationSummary.jsx: Summary of selected options
hooks/:
useReservation.js: Modal state, date selection, equipment logic
services/:
reservationService.js: Mock availability data
styles/:
ReservationModal.css: Modal and component styles
Files to Create
[NEW] 
ReservationModal.jsx
Modal overlay with close button
Displays item details (name, image, location)
Contains Calendar, EquipmentSelector, DurationSelector
Confirm/Cancel buttons
[NEW] 
Calendar.jsx
Shows current month with navigation (prev/next)
Highlights available vs unavailable dates
Allows single or range date selection
Visual indicators for selected dates
[NEW] 
EquipmentSelector.jsx
List of available equipment (projectors, cameras, etc.)
Checkboxes for multi-selection
Shows equipment availability
[NEW] 
DurationSelector.jsx
Time slot picker (morning, afternoon, full day)
Duration input (hours/days)
Start/end time display
[NEW] 
useReservation.js
Modal open/close state
Selected dates state
Selected equipment state
Duration state
Validation logic
[MODIFY] 
ItemCard.jsx
Add onClick handler to "Ver Calendario" button
Pass item data to modal
Verification Plan
Functional Tests
Click "Ver Calendario" opens modal
Calendar shows current month correctly
Can select available dates
Can select multiple equipment items
Can set duration
Confirm button validates and closes modal
Cancel/close button closes without saving
Visual Tests
Modal overlay dims background
Calendar is responsive
Equipment list is scrollable if needed
All components match design aesthetic