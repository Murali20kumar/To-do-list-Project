$(document).ready(function () {
    // Add a new task
    $('#task-form').submit(function (e) {
        e.preventDefault();

        const task = $('#task-input').val().trim(); // Input source (task name from textbox)

        if (!task) {
            alert('Please fill out this field!');
            return;
        }

        // AJAX call for adding a new task and connecting to backend
        $.ajax({
            url: 'http://127.0.0.1:3000/tasks',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ task }),
            success: function (newTask) {
                $('#task-input').val(''); // Clear input field
                $('#taskList').append(renderTask(newTask)); // Add the new task dynamically
            },
            error: function (err) {
                console.error('Error adding task:', err);
            }
        });
    });

    // Fetch all tasks from backend
    function fetchTasks() {
        $.ajax({
            url: 'http://127.0.0.1:3000/tasks',
            method: 'GET',
            success: function (tasks) {
                const filterValue = $('input[name="filter"]:checked').val(); // Get selected filter
                $('#taskList').empty(); // Clear current list
                let count = 0;
    
                tasks.forEach(task => {
                    
                    if(task.status === 0) {
                        count++;
                    }
                    if (
                        filterValue === 'all' ||
                        (filterValue === 'completed' && task.status === 1) ||
                        (filterValue === 'inprogress' && task.status === 0)
                    ) {
                        const taskElement = renderTask(task); // Generate task HTML
                        $('#taskList').append(taskElement);
    
                        //completion validation
                        if (task.status === 1) {
                            const taskItem = $(`[data-id="${task.id}"]`);
                            taskItem.find('.edit-btn, .delete-btn').remove(); // Remove buttons
                            taskItem.find('.complete-btn').replaceWith('<span class="text-completed" style="color:green"><strong>Completed &#9989;</strong></span>');
                            taskItem.css('cursor', 'not-allowed'); // Disable interaction
                        }
                    }
                });

                $('#pendingTaskCount').text('Pending Tasks:' +" "+ count); // Update pending task count
                $('#completeTaskCount').text('Completed Tasks:'  +" "+ (tasks.length - count)); // Update completed task count
            },
            error: function (err) {
                console.error('Error fetching tasks:', err);
            }
        });
    }

    //To filter tasks
    $('input[name="filter"]').on('change', function () {
        fetchTasks();
    });
    

   //To List all data from the database
    function renderTask(task) {
        return `
            <li data-id="${task.id}">
            <div class="task-container">
                <span class="task-name">${task.name}</span>
                <div class="task-actions">
                    <button class="favorites-btn"><i class="fa-solid fa-heart"></i></button>
                    <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
                    <button class="complete-btn"><i class="fa-solid fa-check"></i></button>
                </div>
                </div>
            </li>
        `;
    }

    // Delete a task
    $('#taskList').on('click', '.delete-btn', function () {
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

    $('#clear-completed').on('click', function () {
        // Remove all completed tasks from the DOM
        $('#taskList li').each(function () {
            const isCompleted = $(this).find('.text-completed').length > 0; // Check if the task is marked as completed
            if (isCompleted) {
                $(this).remove(); // Remove the completed task
            }
        });

        // Update the completed task count
        const pendingCount = $('#taskList li').length; // Remaining tasks
        $('#pendingTaskCount').text(`Pending Tasks: ${pendingCount}`);
        $('#completeTaskCount').text('Completed Tasks: 0'); // Reset completed count
    });


     // Edit a task
     $('#taskList').on('click', '.edit-btn', function () {
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

    //Complete button ajax call
    $('#taskList').on('click', '.complete-btn', function () {
        const taskId = $(this).closest('li').data('id'); // Get the task ID
        const taskItem = $(this).closest('li'); // Select the task row
    
        // Send a PUT request to update the status
        $.ajax({
            url: `http://127.0.0.1:3000/tasks/${taskId}/status`, 
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ status: 1 }), // Set status to 1
            success: function () {
            
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
                fetchTasks(); 
            },
            error: function (err) {
                console.error('Error completing task:', err);
            }
        });
    });

    // Load tasks when the page is ready
    fetchTasks();
});