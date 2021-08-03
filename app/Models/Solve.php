<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Solve extends Model
{
    use HasFactory;

    protected $fillable = ['problem_id', 'user_id', 'correct', 'solution'];

    public function problem()
    {
        return $this->belongsTo(Problem::class, 'problem_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
