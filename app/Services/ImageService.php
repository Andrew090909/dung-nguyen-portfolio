<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ImageService
{
    /**
     * Validate, resize and store a raster upload as WebP.
     *
     * Upload validation is also enforced by each FormRequest. This service is a
     * second defensive layer and centralizes image optimization.
     */
    public function storeWebp(UploadedFile $file, string $directory, int $maxWidth = 1920): string
    {
        $mime = $file->getMimeType();
        $allowed = ['image/jpeg', 'image/png', 'image/webp'];

        if (! in_array($mime, $allowed, true)) {
            throw new RuntimeException('Unsupported image format.');
        }

        if (! function_exists('imagecreatefromstring') || ! function_exists('imagewebp')) {
            throw new RuntimeException('The PHP GD extension with WebP support is required.');
        }

        $image = imagecreatefromstring($file->get());
        if ($image === false) {
            throw new RuntimeException('The uploaded image cannot be decoded.');
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $targetWidth = min($width, $maxWidth);
        $targetHeight = (int) round($height * ($targetWidth / max(1, $width)));
        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);

        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagecopyresampled($canvas, $image, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

        ob_start();
        $encoded = imagewebp($canvas, null, 82);
        $webp = ob_get_clean();
        imagedestroy($image);
        imagedestroy($canvas);

        if (! $encoded || ! is_string($webp)) {
            throw new RuntimeException('The optimized image could not be encoded.');
        }

        $name = pathinfo($file->hashName(), PATHINFO_FILENAME).'.webp';
        $path = trim($directory, '/').'/'.$name;
        Storage::disk('public')->put($path, $webp);

        return '/storage/'.$path;
    }
}
