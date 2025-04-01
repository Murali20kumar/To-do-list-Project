$(document).ready(function () {
    // Add a new task
    $('#task-form').submit(function (e) {
        e.preventDefault();
        const task = $('#task-input').val().trim(); // Trim whitespace

        // Empty input box validation
        if (!task) {
            // If input is empty, show an alert or message
            alert('Please fill out this field!');
            return;
        }

        // Send the task to the backend via AJAX
        $.ajax({
            url: 'http://127.0.0.1:3000/tasks',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ task }),
            success: function (newTask) {
                $('#task-input').val(''); // Clear input field
                $('#task-list').append(renderTask(newTask)); // Append the new task
            },
            error: function (err) {
                console.error('Error adding task:', err);
            }
        });
    });

    // Fetch all tasks
    function fetchTasks() {
        $.ajax({
            url: 'http://127.0.0.1:3000/tasks', // Fetch all tasks
            method: 'GET',
            success: function (tasks) {
                console.log('Fetched tasks:', tasks); // Log fetched tasks
                $('#task-list').empty(); // Clear current list
                tasks.forEach(task => {
                    const taskElement = renderTask(task); // Generate task HTML
                    $('#task-list').append(taskElement);
    
                    if (task.status === 1) { // Check if the task is completed
                        const taskItem = $(`[data-id="${task.id}"]`);
                        taskItem.find('.edit-btn, .delete-btn').remove(); // Remove buttons
                        taskItem.find('.complete-btn').replaceWith('<span class="text-completed" style="color:green"><strong>Completed &#9989;</strong></span>'); // Add Completed text
                        taskItem.css('cursor', 'not-allowed'); // Disable interaction
                    }
                });
                populateTaskTable(tasks); 
                applySearchFilter(); 
            },
            error: function (err) {
                console.error('Error fetching tasks:', err);
            }
        });
    }

    // Render a task item with Edit, Delete and Complete buttons
    function renderTask(task) {
        return `    
            <li data-id="${task.id}">
                <span>${task.name}</span>
                <div>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                    <button class="complete-btn">Complete</button>
                </div>
            </li>
        `;
    }

    // Edit a task
    $('#task-list').on('click', '.edit-btn', function () {
        const taskId = $(this).closest('li').data('id');
        const currentTask = $(this).closest('li').find('span').text();
        const updatedTask = prompt('Edit your task:', currentTask);

        if (updatedTask && updatedTask.trim() !== '') {
            $.ajax({
                url: `http://127.0.0.1:3000/tasks/${taskId}`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ task: updatedTask }),
                success: function () {
                    fetchTasks(); // Refresh task list

                },
                error: function (err) {
                    console.error('Error updating task:', err);
                }
            });
        } else {
            alert('Task cannot be empty!');
        }
    });

    // Delete a task
    $('#task-list').on('click', '.delete-btn', function () {
        const taskId = $(this).closest('li').data('id');
        console.log('Task ID to delete:', taskId);

        $.ajax({
            url: `http://127.0.0.1:3000/tasks/${taskId}`,
            method: 'DELETE',
            success: function () {
                fetchTasks(); // Refresh task list
            },
            error: function (err) {
                console.error('Error deleting task:', err);
            }
        });
    });

    //complete a task
    $('#task-list').on('click', '.complete-btn', function () {
        const taskId = $(this).closest('li').data('id'); // Get the task ID
        const taskItem = $(this).closest('li'); // Select the task row
    
        // Send a PUT request to update the status
        $.ajax({
            url: `http://127.0.0.1:3000/tasks/${taskId}/status`, // Backend endpoint
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ status: 1 }), // Set status to 1
            success: function () {
                // taskItem.find('.edit-btn, .delete-btn').remove(); // Remove Edit/Delete buttons
                // taskItem.find('.complete-btn').replaceWith('<span class="text-completed" style="color:green"><strong>Completed &#9989;</strong></span>'); // Replace Complete button with text
                // taskItem.css('cursor', 'not-allowed'); // Disable cursor changes

                const popup = $('#popup');
                popup.fadeIn(); // Show the pop-up with fade-in animation
    
                // Hide the pop-up after 3 seconds
                setTimeout(() => {
                    popup.fadeOut(); // Fade out the pop-up
                }, 5000);
                confetti({
                    particleCount: 200,
                    spread: 70,
                    origin: { y: 0.6 },
                    duration: 5000,
                    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#800080'], 
                });
                
    
            },

            
            error: function (err) {
                console.error('Error completing task:', err);
            }
        });
    });
    
    // Fetch tasks on page load
    fetchTasks();
});