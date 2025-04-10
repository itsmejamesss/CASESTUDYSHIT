<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TeamMemberController;

// Public Routes (Login & Register)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Require Authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Project Managers Only
    Route::middleware('role:project_manager')->group(function () {
        Route::post('/projects', [ProjectController::class, 'store']);
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::put('/projects/{id}', [ProjectController::class, 'update']);
        Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
        Route::get('/projects/{project}/team-members', [ProjectController::class, 'getTeamMembers']);
        Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);
        Route::post('/projects/{project}/assign-team-members', [ProjectController::class, 'assignTeamMembers']);
        Route::get('/users-for-task', [ProjectController::class, 'getUsersForTask']);
    });

    // Team Members Only
    Route::middleware('role:team_member')->group(function () {
        Route::get('/team/projects', [TeamMemberController::class, 'projects']);
        Route::get('/team/tasks', [TeamMemberController::class, 'tasks']);

        // If you want additional project-specific task actions:
        Route::get('/projects/{id}/tasks', [ProjectController::class, 'index']); // Or a dedicated method
        Route::post('/projects/{id}/tasks', [ProjectController::class, 'storeTask']); // If defined
        Route::delete('/projects/{id}/tasks/{task_id}', [ProjectController::class, 'destroyTask']); // If defined
    });

    Route::post('/logout', [AuthController::class, 'logout']);
});
