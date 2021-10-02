<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Star extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = ['user_id', 'problem_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function problem()
    {
        return $this->belongsTo(Problem::class, 'problem_id', 'id');
    }
}
