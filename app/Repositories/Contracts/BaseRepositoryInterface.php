<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface BaseRepositoryInterface
{
    /** @return Collection<int, Model> */
    public function all(): Collection;

    public function findOrFail(int $id): Model;

    /** @param array<string, mixed> $attributes */
    public function create(array $attributes): Model;

    /** @param array<string, mixed> $attributes */
    public function update(Model $model, array $attributes): Model;

    public function delete(Model $model): bool;
}
