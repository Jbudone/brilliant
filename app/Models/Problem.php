<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

//use Typesense\LaravelTypesense\Interfaces\TypesenseDocument;
//use Laravel\Scout\Searchable;
//use Carbon\Carbon;

//class Problem extends Model implements TypesenseDocument
class Problem extends Model
{
    use HasFactory;
    //use HasFactory, Searchable;

    protected $fillable = ['title', 'category_id', 'level', 'body', 'author_id', 'solution', 'source', 'discussion', 'archive_id', 'votes', 'points'];

    public function topic()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id', 'id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function solves()
    {
        return $this->hasMany(Solves::class);
    }


/*
    public function toSearchableArray()
    {
        $array = $this->toArray();

        // Customize array...
        //unset($array['created_at']); // FIXME: hide all but name?

        // Typesense restrictions
        $array['id'] = (string)$array['id'];
        $array['created_at'] = (integer)Carbon::parse($array['created_at'])->timestamp;

        return $array;
    }

    public function getCollectionSchema(): array {
        return [
            'name' => $this->searchableAs(),
            'fields' => [
            [
                'name' => 'title',
                'type' => 'string',
            ],
            [
                'name' => 'created_at',
                'type' => 'int32',
            ],
            ],
            'default_sorting_field' => 'created_at',
        ];
    }

    public function typesenseQueryBy(): array {
        return [
            'name',
        ];
    }
*/
}
