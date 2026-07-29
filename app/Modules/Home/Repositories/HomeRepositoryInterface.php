<?php

namespace App\Modules\Home\Repositories;

interface HomeRepositoryInterface
{
    /** @return array<string, mixed> */
    public function overview(string $locale): array;
}
