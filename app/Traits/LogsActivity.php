<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

trait LogsActivity
{
    /** Register automatic auditable model events. */
    protected static function bootLogsActivity(): void
    {
        foreach (['created', 'updated', 'deleted', 'restored'] as $event) {
            static::$event(function (Model $model) use ($event): void {
                if (app()->runningInConsole() && ! app()->runningUnitTests()) {
                    return;
                }

                $sensitive = ['password', 'remember_token'];
                $oldValues = $event === 'updated' ? Arr::except($model->getOriginal(), $sensitive) : null;
                $newValues = $event === 'deleted' ? null : Arr::except($model->getAttributes(), $sensitive);

                ActivityLog::query()->create([
                    'user_id' => auth()->id(),
                    'auditable_type' => $model::class,
                    'auditable_id' => $model->getKey(),
                    'event' => $event,
                    'old_values' => $oldValues,
                    'new_values' => $newValues,
                    'ip_address' => request()?->ip(),
                    'user_agent' => request()?->userAgent(),
                ]);
            });
        }
    }
}
