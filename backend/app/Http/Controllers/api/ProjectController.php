<?php

namespace App\Http\Controllers\Api;

use App\Models\Project;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class ProjectController extends Controller
{
    /**
     * Store a new project.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'required|string',
            'deadline'    => 'required|date|after_or_equal:today',
            // Optionally include team_member_ids in the request:
            'team_member_ids' => 'array', // array of user_ids
            'team_member_ids.*' => 'exists:users,id',
        ]);

        $project = Project::create([
            'name'        => $request->name,
            'description' => $request->description,
            'deadline'    => $request->deadline,
            'owner_id'    => Auth::id(),
        ]);

        // Attach team members if provided:
        if ($request->has('team_member_ids')) {
            $project->teamMembers()->attach($request->team_member_ids, ['role' => 'team_member']);
        }

        return response()->json(['message' => 'Project created successfully', 'project' => $project], 201);
    }

    /**
     * List all projects for the authenticated user.
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Fetch projects where the authenticated user is the owner
        $projects = Project::with(['tasks', 'teamMembers'])->where('owner_id', $user->id)->get();

        return response()->json(['projects' => $projects]);
    }

    /**
     * Show a single project.
     */
    public function show($id)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $project = Project::find($id);

        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        // Ensure the authenticated user owns the project
        if ($project->owner_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json(['project' => $project]);
    }

    /**
     * Update a project.
     */
    public function update(Request $request, $id)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $project = Project::find($id);
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        if ($project->owner_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'deadline'    => 'sometimes|date|after_or_equal:today',
        ]);

        $project->update($request->only(['name', 'description', 'deadline']));

        return response()->json(['message' => 'Project updated successfully', 'project' => $project]);
    }

    /**
     * Delete a project.
     */
    public function destroy($id)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $project = Project::find($id);
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        if ($project->owner_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }

    /**
     * Get team members for the given project.
     */
    public function getTeamMembers(Project $project)
    {
        $user = Auth::user();
        if (!$user || $user->id !== $project->owner_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Assumes $project->teamMembers relationship is defined
        return response()->json(['members' => $project->teamMembers]);
    }

    public function getUsersForTask()
    {
        // Fetch users who are either project managers or team members
        $users = User::whereIn('role', ['team_member'])->get();

        return response()->json($users);
    }

    public function assignTeamMembers(Request $request, Project $project)
    {
        $request->validate([
            'team_member_ids' => 'required|array',  // Validate that it's an array
            'team_member_ids.*' => 'exists:users,id',  // Validate that each user ID exists in the users table
        ]);

        // Attach new team members without detaching existing ones:
        $project->teamMembers()->syncWithoutDetaching(
            array_fill_keys($request->team_member_ids, ['role' => 'team_member'])
        );

        // Fetch the updated list of team members after assignment
        $updatedTeamMembers = $project->teamMembers;

        return response()->json([
            'message' => 'Team members assigned successfully',
            'members' => $updatedTeamMembers,  // Return the updated team members
        ]);
    }
}
