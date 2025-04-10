<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'contact_info',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Update: Define casts as a property.
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Relationship: A User belongs to many Projects as either a Project Manager or Team Member.
     * This method returns all the projects the user is associated with.
     */
    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_user', 'user_id', 'project_id')
            ->withPivot('role'); // Include the pivot 'role' column in the relationship
    }

    /**
     * Relationship: A User is assigned to many tasks.
     */
    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    /**
     * Get all projects where the user is the project manager.
     */
    public function projectManagerProjects()
    {
        return $this->projects()->wherePivot('role', 'project_manager');
    }

    /**
     * Get all projects where the user is a team member.
     */
    public function teamMemberProjects()
    {
        return $this->projects()->wherePivot('role', 'team_member');
    }
}
