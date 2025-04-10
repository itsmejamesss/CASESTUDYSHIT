<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'deadline',
        'owner_id',
    ];

    // Relationship: A Project belongs to a Project Manager (Owner)
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    // Relationship: A Project has many Tasks
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    // Relationship: A Project has many assigned team members (Many-to-Many with roles)
    public function teamMembers()
    {
        return $this->belongsToMany(User::class, 'project_user', 'project_id', 'user_id')
            ->withPivot('role') // Include 'role' from pivot table
            ->wherePivot('role', 'team_member'); // Filter by 'team_member' role
    }

    // Relationship: A Project has a Project Manager (Role = project_manager)
    public function projectManager()
    {
        return $this->belongsToMany(User::class, 'project_user', 'project_id', 'user_id')
            ->withPivot('role')
            ->wherePivot('role', 'project_manager');
    }
}
