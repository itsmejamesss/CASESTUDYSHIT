<?php

namespace App\Http\Controllers\Api;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class TeamMemberController extends Controller
{
    /**
     * Get projects that have at least one task assigned to the authenticated team member.
     */
    public function projects()
    {
        $user = Auth::user();
        $projects = Project::whereHas('tasks', function ($query) use ($user) {
            $query->where('assigned_to', $user->id);
        })->get();

        return response()->json(['projects' => $projects]);
    }

    /**
     * Get all tasks assigned to the authenticated team member.
     */
    public function tasks()
    {
        $user = Auth::user();
        $tasks = Task::where('assigned_to', $user->id)->get();

        return response()->json(['tasks' => $tasks]);
    }
}
