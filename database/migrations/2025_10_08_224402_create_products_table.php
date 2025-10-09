<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name', 150);
            $table->text('description')->nullable();
            // $table->string('sku', 50)->unique();
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('unit_price', 12, 2);
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(5);
            $table->date('expiry_date')->nullable();
            $table->string('image_url', 100)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
