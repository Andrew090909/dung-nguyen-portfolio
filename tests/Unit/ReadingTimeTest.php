<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ReadingTimeTest extends TestCase
{
    public function test_reading_time_never_returns_zero(): void
    {
        require_once dirname(__DIR__, 2).'/app/Helpers/helpers.php';
        $this->assertSame(1, reading_time('A concise article.'));
    }
}
