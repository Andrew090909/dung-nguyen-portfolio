<?php

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Repositories\AdminRepositoryInterface;
use App\Services\ImageService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminContentService
{
    public function __construct(
        private readonly AdminRepositoryInterface $repository,
        private readonly ImageService $images,
    ) {}

    /** @param class-string<Model> $modelClass @param list<string> $with */
    public function paginate(string $modelClass, array $with = []): LengthAwarePaginator
    {
        return $this->repository->paginate($modelClass, $with);
    }

    /** @param class-string<Model> $modelClass */
    public function find(string $modelClass, int $id): Model
    {
        return $this->repository->findOrFail($modelClass, $id);
    }

    /** @param class-string<Model> $modelClass @param array<string, mixed> $data */
    public function create(string $modelClass, array $data, ?string $imageField = null, string $directory = 'uploads'): Model
    {
        return DB::transaction(function () use ($modelClass, $data, $imageField, $directory): Model {
            $data = $this->applyBooleanDefaults($modelClass, $data);
            $payload = $this->preparePayload($data, $imageField, $directory);
            $model = $this->repository->create($modelClass, $payload);
            $this->flushPublicCache();

            return $model;
        });
    }

    /** @param array<string, mixed> $data */
    public function update(Model $model, array $data, ?string $imageField = null, string $directory = 'uploads'): Model
    {
        return DB::transaction(function () use ($model, $data, $imageField, $directory): Model {
            $data = $this->applyBooleanDefaults($model::class, $data);
            $payload = $this->preparePayload($data, $imageField, $directory);
            $updated = $this->repository->update($model, $payload);
            $this->flushPublicCache();

            return $updated;
        });
    }

    public function delete(Model $model): void
    {
        $this->repository->delete($model);
        $this->flushPublicCache();
    }

    /** @param class-string<Model> $modelClass */
    public function options(string $modelClass): Collection
    {
        return $this->repository->options($modelClass);
    }


    /** @param class-string<Model> $modelClass @param array<string, mixed> $data @return array<string, mixed> */
    private function applyBooleanDefaults(string $modelClass, array $data): array
    {
        $fields = match ($modelClass) {
            \App\Models\Post::class => ['is_featured'],
            \App\Models\Product::class => ['is_active', 'is_featured'],
            \App\Models\Category::class, \App\Models\Banner::class, \App\Models\User::class => ['is_active'],
            \App\Models\Page::class => ['is_published'],
            default => [],
        };

        foreach ($fields as $field) {
            $data[$field] = (bool) ($data[$field] ?? false);
        }

        return $data;
    }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    private function preparePayload(array $data, ?string $imageField, string $directory): array
    {
        if ($imageField && Arr::get($data, $imageField) instanceof UploadedFile) {
            $data[$imageField] = $this->images->storeWebp($data[$imageField], $directory);
        } elseif ($imageField) {
            unset($data[$imageField]);
        }

        if (array_key_exists('password', $data) && blank($data['password'])) {
            unset($data['password']);
        }

        foreach (['is_active', 'is_featured', 'is_published'] as $boolean) {
            if (array_key_exists($boolean, $data)) {
                $data[$boolean] = (bool) $data[$boolean];
            }
        }

        if (isset($data['features']) && is_array($data['features'])) {
            $data['features'] = array_map(
                static fn (array $items): array => array_values(array_filter($items, static fn (mixed $item): bool => filled($item))),
                $data['features'],
            );
        }

        return $data;
    }

    private function flushPublicCache(): void
    {
        foreach (['vi', 'en', 'zh'] as $locale) {
            Cache::forget("home:{$locale}");
        }
        Cache::forget('pricing:services');
        Cache::forget('portfolio:published');
        Cache::forget('admin:dashboard:metrics');
        foreach (['home', 'pricing', 'portfolio', 'insights', 'contact'] as $pageKey) {
            Cache::forget("page-seo:{$pageKey}");
        }
    }
}
