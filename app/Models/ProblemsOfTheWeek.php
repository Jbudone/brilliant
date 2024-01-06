<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProblemsOfTheWeek extends Model
{
    use HasFactory;

    protected $fillable = ['week', 'level', 'count'];

    public function problems()
    {
        return $this->hasMany(Problem::class, 'problemsoftheweek_id', 'id');
    }

}
