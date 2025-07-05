# **API Documentation: Statistics Service**

This document provides a comprehensive guide to the Statistics API. These endpoints are designed to provide structure administrators with valuable insights and performance metrics about their events and overall activity.

### **1\. Overview & Security**

The Statistics API exposes aggregated data, ready for visualization in a frontend dashboard using libraries like Chart.js.

* **Authentication**: All endpoints are secure and require a valid JWT Bearer Token in the Authorization header.
* **Authorization**: Access to statistics is strictly controlled. A user must have a StaffUser Role (STRUCTURE_ADMINISTRATOR, ORGANIZATION_SERVICE, RESERVATION_SERVICE) role and be the designated owner of the requested structure or event to access its data. Any attempt to access data belonging to another structure will result in a 403 Forbidden error.

### **2\. Data Transfer Objects (DTOs)**

The API uses a set of specialized DTOs to deliver data in a structured and predictable format.

#### **Core DTOs**

* **ChartJsDataDto.java**: A generic, reusable DTO for chart data.
  * chartType (String): The suggested chart type (e.g., "bar", "line", "doughnut").
  * labels (List\<String\>): The labels for the X-axis or chart segments.
  * datasets (List\<ChartJsDataset\>): A list of datasets to be plotted.
* **ChartJsDataset.java**: Represents a single dataset within a chart.
  * label (String): The name of the dataset.
  * data (List\<Number\>): The numerical data points.
  * backgroundColor (List\<String\>): Colors for bar or doughnut charts.
  * borderColor (String): Color for line charts.

#### **Response DTOs**

* **StructureDashboardStatsDto.java**: The main DTO for the structure-level dashboard. Contains all KPIs and global charts.
* **EventStatisticsDto.java**: The main DTO for event-specific statistics. Contains all charts related to a single event.

### **3\. API Endpoints**

#### **3.1. Structure Statistics**

This endpoint provides a high-level overview of a structure's performance.

* **Endpoint**: GET /api/v1/statistics/structure/{structureId}/dashboard
* **Controller**: StatisticsController.java
* **Description**: Retrieves a consolidated set of Key Performance Indicators (KPIs) and charts for a specific structure's main dashboard.
* **Permissions**: Requires StaffUser role for the specified {structureId}.

##### **Success Response (200 OK)**

Returns a StructureDashboardStatsDto object.

**Example Response Body:**

{  
"upcomingEventsCount": 5,  
"totalTicketsReserved": 12450,  
"totalExpectedAttendees": 3200,  
"averageAttendanceRate": 88.5,  
"topEventsChart": {  
"chartType": "bar",  
"labels": \["Festival Electronic Waves", "Concert Nekfeu", "FC Metz vs Lyon"\],  
"datasets": \[{  
"label": "Tickets Sold",  
"data": \[4500, 3200, 2800\]  
}\]  
},  
"attendanceByCategoryChart": {  
"chartType": "doughnut",  
"labels": \["Concert", "Sport", "Festival"\],  
"datasets": \[{  
"label": "Attendees",  
"data": \[7700, 2800, 1950\]  
}\]  
}  
}

##### **Error Responses**

* **401 Unauthorized**: No valid JWT was provided.
* **403 Forbidden**: The authenticated user is not the administrator of the requested structure.
* **404 Not Found**: The structure with the given structureId does not exist.

#### **3.2. Event Statistics**

This endpoint provides a deep dive into the performance of a single event.

* **Endpoint**: GET /api/v1/statistics/event/{eventId}
* **Controller**: StatisticsController.java
* **Description**: Retrieves detailed statistics and charts for a specific event.
* **Permissions**: Requires StaffUser role for the structure that owns the specified {eventId}.

##### **Success Response (200 OK)**

Returns an EventStatisticsDto object.

**Example Response Body:**

{  
"eventId": 2,  
"eventName": "Festival Electronic Waves",  
"zoneFillRateChart": {  
"chartType": "bar",  
"labels": \["Fosse", "VIP Area"\],  
"datasets": \[  
{  
"label": "Tickets Sold",  
"data": \[950, 85\]  
},  
{  
"label": "Capacity",  
"data": \[1000, 100\]  
}  
\]  
},  
"reservationsOverTimeChart": {  
"chartType": "line",  
"labels": \["2025-06-01", "2025-06-02", "2025-06-03"\],  
"datasets": \[{  
"label": "Reservations",  
"data": \[250, 600, 950\]  
}\]  
},  
"ticketStatusChart": {  
"chartType": "doughnut",  
"labels": \["VALID", "USED", "CANCELLED"\],  
"datasets": \[{  
"label": "Tickets",  
"data": \[600, 350, 25\]  
}\]  
}  
}

##### **Error Responses**

* **401 Unauthorized**: No valid JWT was provided.
* **403 Forbidden**: The authenticated user does not own the structure associated with this event.
* **404 Not Found**: The event with the given eventId does not exist.


Example Data : 

GET "{{baseUrl}}/statistics/structure/6/dashboard"

{
"upcomingEventsCount": 11,
"totalTicketsReserved": 365,
"totalExpectedAttendees": 265,
"averageAttendanceRate": 0,
"topEventsChart": {
"chartType": "bar",
"labels": [
"Scène Ouverte Poésie & Slam",
"Nuit du Blues & Soul"
],
"datasets": [
{
"label": "Tickets Sold",
"data": [
225,
140
],
"backgroundColor": [
"#FF6384",
"#36A2EB"
],
"borderColor": "#FFFFFF",
"fill": false
}
]
},
"attendanceByCategoryChart": {
"chartType": "doughnut",
"labels": [
"Humour",
"Théâtre",
"Concert",
"Festival"
],
"datasets": [
{
"label": "Attendees",
"data": [
225,
225,
140,
140
],
"backgroundColor": [
"#FF6384",
"#36A2EB",
"#FFCE56",
"#4BC0C0"
],
"borderColor": "#FFFFFF",
"fill": false
}
]
}
}

GET "{{baseUrl}}/statistics/event/20"

{
"eventId": 20,
"eventName": "Nuit du Blues & Soul",
"zoneFillRateChart": {
"chartType": "bar",
"labels": [
"Placement libre Caveau"
],
"datasets": [
{
"label": "Fill Rate (%)",
"data": [
70
],
"backgroundColor": [
"#FF6384"
],
"borderColor": "#FF6384",
"fill": false
},
{
"label": "Capacity",
"data": [
200
],
"backgroundColor": [
"#36A2EB"
],
"borderColor": "#36A2EB",
"fill": false
},
{
"label": "Tickets Sold",
"data": [
140
],
"backgroundColor": [
"#FFCE56"
],
"borderColor": "#FFCE56",
"fill": false
}
]
},
"reservationsOverTimeChart": {
"chartType": "line",
"labels": [
"2025-06-15",
"2025-06-17"
],
"datasets": [
{
"label": "Reservations",
"data": [
100,
40
],
"backgroundColor": [
"rgba(54, 162, 235, 0.2)"
],
"borderColor": "rgba(54, 162, 235, 1)",
"fill": true
}
]
},
"ticketStatusChart": {
"chartType": "doughnut",
"labels": [
"USED",
"VALID",
"CANCELLED"
],
"datasets": [
{
"label": "Tickets",
"data": [
100,
40,
10
],
"backgroundColor": [
"#36A2EB",
"#4BC0C0",
"#FF6384"
],
"borderColor": "#FFFFFF",
"fill": false
}
]
}
}
