<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Typesense\LaravelTypesense\Interfaces\TypesenseDocument;
use Laravel\Scout\Searchable;
use Carbon\Carbon;

class User extends Authenticatable implements TypesenseDocument
{
    use HasFactory, Notifiable, Searchable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'archive_id',
        'email_verified_at',
        'remember_token',
        'status'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];


    public function toSearchableArray()
    {
        return [
            'id' => (string)$this->id,
            'created_at' => (integer)Carbon::parse($this->created_at)->timestamp,
            'name' => $this->name
        ];
    }

    public function getCollectionSchema(): array {
        return [
            'name' => $this->searchableAs(),
            'fields' => [
            [
                'name' => 'name',
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
}
