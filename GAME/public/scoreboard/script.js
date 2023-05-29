// Check if local storage is supported
if (typeof(Storage) !== "undefined") {
  // Get the previous order and sort order values from local storage
  var previousOrder = localStorage.getItem("previousOrder");
  var previousSortOrder = localStorage.getItem("previousSortOrder");
}

// Add a click event listener to all th elements
document.querySelectorAll("#scoreTable th").forEach(function(th) {
  th.addEventListener("click", function() {
    const orderBy = this.getAttribute("data-order-by");
    let sortOrder = "DESC";
    
    // Toggle the sort order if the same column header is clicked twice
    if (orderBy === previousOrder && previousSortOrder === "DESC") {
      sortOrder = "ASC";
    }
    
    previousOrder = orderBy;
    previousSortOrder = sortOrder;
    
    // Store the new order and sort order values in local storage
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem("previousOrder", previousOrder);
      localStorage.setItem("previousSortOrder", previousSortOrder);
    }
    
    // Reload the page with the new order parameters
    window.location.href = "?order_by=" + orderBy + "&sort_order=" + sortOrder;
  });
});
