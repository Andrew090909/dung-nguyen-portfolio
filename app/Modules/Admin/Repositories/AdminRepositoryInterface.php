<?php

namespace App\Modules\Admin\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface AdminRepositoryInterface
{
    /** @param class-string<Model> $modelClass @param list<string> $with */
    public function paginate(string $modelClass, array $with = [], int $perPage = 20): LengthAwarePaginator;

    /** @param class-string<Model> $modelClass */
    public function findOrFail(string $modelClass, int $id): Model;

    /** @param class-string<Model> $modelClass @param array<string, mixed> $data */
    public function create(string $modelClass, array $data): Model;

    /** @param array<string, mixed> $data */
    public function update(Model $model, array $data): Model;

    public function delete(Model $model): bool;

    /** @param class-string<Model> $modelClass */
    public function options(string $modelClass): Collection;
}
