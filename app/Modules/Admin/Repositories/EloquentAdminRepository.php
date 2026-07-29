<?php

namespace App\Modules\Admin\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class EloquentAdminRepository implements AdminRepositoryInterface
{
    public function paginate(string $modelClass, array $with = [], int $perPage = 20): LengthAwarePaginator
    {
        return $modelClass::query()->with($with)->latest('id')->paginate($perPage)->withQueryString();
    }

    public function findOrFail(string $modelClass, int $id): Model
    {
        return $modelClass::query()->findOrFail($id);
    }

    public function create(string $modelClass, array $data): Model
    {
        return $modelClass::query()->create($data);
    }

    public function update(Model $model, array $data): Model
    {
        $model->fill($data)->save();

        return $model->refresh();
    }

    public function delete(Model $model): bool
    {
        return (bool) $model->delete();
    }

    public function options(string $modelClass): Collection
    {
        return $modelClass::query()->orderBy('id')->get();
    }
}
