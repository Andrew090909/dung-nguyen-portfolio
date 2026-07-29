<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('portfolio:health', function (): void {
    $this->info('Dũng Nguyễn Portfolio V11 is healthy.');
})->purpose('Run a lightweight application health check');
