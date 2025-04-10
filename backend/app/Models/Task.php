<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'priority',
        'status',
        'due_date',
        'project_id',
        'assigned_to',
    ];

    // Relationship: A Task belongs to a Project
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Relationship: A Task is assigned to a specific User (Team Member only)
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to')
            ->where('role', 'team_member');
    }
}
