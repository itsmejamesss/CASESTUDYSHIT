<?php

namespace App\Http\Controllers\Api;

use App\Models\Task;
use App\Models\Project;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Store a new task for a project.
     */
    public function store(Request $request, Project $project)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|string|in:Low,Medium,High',
            'due_date' => 'required|date',
            'assigned_to' => 'required|exists:users,id',
            'project_id' => 'required|exists:projects,id',
        ]);

        // If no assigned_to is provided, you can either leave it null or add a default team member or owner.
        $task = $project->tasks()->create($validatedData);

        return response()->json(['message' => 'Task created successfully', 'task' => $task], 201);
    }

    /**
     * List all tasks for a project.
     */
    public function index(Project $project)
    {
        return response()->json(['tasks' => $project->tasks]);
    }

    /**
     * Update a task.
     */
    public function update(Request $request, Task $task)
    {
        // Optionally, add validation here as done in store.
        $validatedData = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'priority'    => 'sometimes|in:Low,Medium,High',
            'due_date'    => 'sometimes|date',
            'assigned_to' => 'nullable|exists:users,id',  // Ensure user exists
        ]);

        $task->update($validatedData);  // Update task with validated data

        return response()->json(['message' => 'Task updated successfully', 'task' => $task]);
    }

    /**
     * Delete a task.
     */
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }
}
