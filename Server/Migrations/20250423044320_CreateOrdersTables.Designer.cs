﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Server.Data;

#nullable disable

namespace Server.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20250423044320_CreateOrdersTables")]
    partial class CreateOrdersTables
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.1")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Server.Models.ActiveUser", b =>
                {
                    b.Property<int>("UserId")
                        .HasColumnType("int")
                        .HasColumnName("user_id");

                    b.Property<DateTime>("LoginDate")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime2")
                        .HasColumnName("login_date")
                        .HasDefaultValueSql("SYSUTCDATETIME()");

                    b.Property<string>("Token")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("token");

                    b.HasKey("UserId");

                    b.ToTable("ActiveUsers", (string)null);
                });

            modelBuilder.Entity("Server.Models.BasicItem", b =>
                {
                    b.Property<DateTime?>("AvailFrom")
                        .HasColumnType("datetime2")
                        .HasColumnName("availFrom");

                    b.Property<DateTime?>("AvailTo")
                        .HasColumnType("datetime2")
                        .HasColumnName("availTo");

                    b.Property<string>("Blob")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("blob");

                    b.Property<int>("CategoryId")
                        .HasColumnType("int")
                        .HasColumnName("category");

                    b.Property<int>("ItemId")
                        .HasColumnType("int")
                        .HasColumnName("item_id");

                    b.Property<int>("ListId")
                        .HasColumnType("int")
                        .HasColumnName("list_id");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("name");

                    b.Property<decimal>("Price")
                        .HasColumnType("decimal(18,2)")
                        .HasColumnName("price");

                    b.Property<decimal>("SalePrice")
                        .HasColumnType("decimal(18,2)")
                        .HasColumnName("sale_price");

                    b.Property<int>("StoreId")
                        .HasColumnType("int")
                        .HasColumnName("store_id");

                    b.Property<int>("quantity")
                        .HasColumnType("int")
                        .HasColumnName("quantity");

                    b.ToTable("BasicItem");
                });

            modelBuilder.Entity("Server.Models.DetailItem", b =>
                {
                    b.Property<string>("AvailFrom")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("AvailTo")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Blob")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("CategoryId")
                        .HasColumnType("int");

                    b.Property<string>("Colour")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("CurrentRating")
                        .HasColumnType("int");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("ItemId")
                        .HasColumnType("int");

                    b.Property<int>("ListId")
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<decimal>("Price")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<decimal>("SalePrice")
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("Size")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("StoreId")
                        .HasColumnType("int");

                    b.Property<string>("Type")
                        .HasColumnType("nvarchar(max)");

                    b.ToTable("DetailItem");
                });

            modelBuilder.Entity("Server.Models.Order", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("Notes")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("StoreId")
                        .HasColumnType("int");

                    b.Property<string>("StripePaymentIntentId")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("StripeSessionId")
                        .HasColumnType("nvarchar(max)");

                    b.Property<decimal>("TotalAmount")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("Orders", (string)null);
                });

            modelBuilder.Entity("Server.Models.OrderItem", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("OrderId")
                        .HasColumnType("int");

                    b.Property<int>("ProductId")
                        .HasColumnType("int");

                    b.Property<string>("ProductName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<decimal>("UnitPrice")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("Id");

                    b.HasIndex("OrderId");

                    b.ToTable("OrderItems", (string)null);
                });

            modelBuilder.Entity("Server.Models.OrderLogEntry", b =>
                {
                    b.Property<int>("OrderId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("order_id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("OrderId"));

                    b.Property<string>("DeliveryAddress")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("delivery_address");

                    b.Property<DateTime?>("LogTimestamp")
                        .HasColumnType("datetime2")
                        .HasColumnName("log_timestamp");

                    b.Property<DateTime?>("OrderDate")
                        .HasColumnType("datetime2")
                        .HasColumnName("order_date");

                    b.Property<string>("OrderStatus")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("order_status");

                    b.Property<string>("PurchaserEmail")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("purchaser_email");

                    b.Property<int>("PurchaserId")
                        .HasColumnType("int")
                        .HasColumnName("purchaser_id");

                    b.Property<int>("StoreId")
                        .HasColumnType("int")
                        .HasColumnName("store_id");

                    b.Property<string>("StripeToken")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("stripe_token");

                    b.Property<decimal?>("TotalAmount")
                        .HasColumnType("decimal(18,2)")
                        .HasColumnName("total_amount");

                    b.HasKey("OrderId");

                    b.ToTable("OrderLog", (string)null);
                });

            modelBuilder.Entity("Server.Models.Promotion", b =>
                {
                    b.Property<int>("PromotionId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("PromotionId"));

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("Description")
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<string>("DiscountType")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("nvarchar(20)");

                    b.Property<decimal>("DiscountValue")
                        .HasColumnType("decimal(10,2)");

                    b.Property<DateTime?>("EndDate")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("datetime2");

                    b.Property<int>("StoreId")
                        .HasColumnType("int");

                    b.Property<int?>("UsageLimit")
                        .HasColumnType("int");

                    b.HasKey("PromotionId");

                    b.ToTable("Promotions", (string)null);
                });

            modelBuilder.Entity("Server.Models.Quantity", b =>
                {
                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("TotalQuantity")
                        .HasColumnType("int");

                    b.ToTable("Quantity");
                });

            modelBuilder.Entity("Server.Models.Review", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Comment")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<int>("ProductId")
                        .HasColumnType("int");

                    b.Property<int>("Rating")
                        .HasColumnType("int");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Reviews", (string)null);
                });

            modelBuilder.Entity("Server.Models.Store", b =>
                {
                    b.Property<int>("StoreId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("store_id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("StoreId"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("name");

                    b.Property<int>("StoreOwnerId")
                        .HasColumnType("int")
                        .HasColumnName("owner");

                    b.Property<string>("StoreUrl")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("store_url");

                    b.HasKey("StoreId");

                    b.ToTable("Stores", (string)null);
                });

            modelBuilder.Entity("Server.Models.StoreBanner", b =>
                {
                    b.Property<int>("StoreID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("store_id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("StoreID"));

                    b.Property<string>("BannerURL")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("banner_url");

                    b.HasKey("StoreID");

                    b.ToTable("StoreBanners", (string)null);
                });

            modelBuilder.Entity("Server.Models.StoreLogo", b =>
                {
                    b.Property<int>("StoreID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("store_id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("StoreID"));

                    b.Property<string>("LogoURL")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("logo_url");

                    b.HasKey("StoreID");

                    b.ToTable("StoreLogos", (string)null);
                });

            modelBuilder.Entity("Server.Models.StoreTheme", b =>
                {
                    b.Property<int>("StoreId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("store_id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("StoreId"));

                    b.Property<string>("BannerText")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("banner_text");

                    b.Property<string>("ComponentVisibility")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("component_visibility");

                    b.Property<string>("FontColor")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("font_colour");

                    b.Property<string>("FontFamily")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("font_family");

                    b.Property<string>("LogoText")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("logo_text");

                    b.Property<string>("Theme_1")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("theme_colour1");

                    b.Property<string>("Theme_2")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("theme_colour2");

                    b.Property<string>("Theme_3")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("theme_colour3");

                    b.HasKey("StoreId");

                    b.ToTable("StoreThemes", (string)null);
                });

            modelBuilder.Entity("Server.Models.StoreVisit", b =>
                {
                    b.Property<int>("VisitId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("visit_id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("VisitId"));

                    b.Property<int>("StoreId")
                        .HasColumnType("int")
                        .HasColumnName("store_id");

                    b.Property<int?>("UserId")
                        .HasColumnType("int")
                        .HasColumnName("user_id");

                    b.Property<DateTime>("VisitTimestamp")
                        .HasColumnType("datetime2")
                        .HasColumnName("visit_timestamp");

                    b.HasKey("VisitId");

                    b.HasIndex("StoreId");

                    b.HasIndex("UserId");

                    b.ToTable("StoreVisits", (string)null);
                });

            modelBuilder.Entity("Server.Models.TestItem", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("TestTable", (string)null);
                });

            modelBuilder.Entity("Server.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Address")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("address");

                    b.Property<string>("City")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("city");

                    b.Property<string>("Country")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("country");

                    b.Property<DateTime?>("DOB")
                        .HasColumnType("datetime2")
                        .HasColumnName("dob");

                    b.Property<string>("Email")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("email");

                    b.Property<string>("FirstName")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("first_name");

                    b.Property<string>("LastName")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("last_name");

                    b.Property<string>("Password")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("password");

                    b.Property<string>("Phone")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("phone");

                    b.Property<string>("PostalCode")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("postal_code");

                    b.Property<string>("State")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("state");

                    b.Property<string>("StripeCustomerId")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("stripe_customer_id");

                    b.Property<bool>("Subscribed")
                        .HasColumnType("bit")
                        .HasColumnName("subscribed");

                    b.Property<bool>("Verified")
                        .HasColumnType("bit")
                        .HasColumnName("verified");

                    b.HasKey("Id");

                    b.ToTable("Users", (string)null);
                });

            modelBuilder.Entity("Shopimy.Server.Models.Category", b =>
                {
                    b.Property<int>("CategoryId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("category_id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("CategoryId"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("name");

                    b.Property<int?>("ParentCategory")
                        .HasColumnType("int")
                        .HasColumnName("parent_category");

                    b.Property<int>("StoreId")
                        .HasColumnType("int")
                        .HasColumnName("store_id");

                    b.HasKey("CategoryId");

                    b.ToTable("Categories", (string)null);
                });

            modelBuilder.Entity("ShoppingCart", b =>
                {
                    b.Property<int>("CartId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("CartId"));

                    b.Property<int>("ItemId")
                        .HasColumnType("int");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<int>("StoreId")
                        .HasColumnType("int");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("CartId");

                    b.ToTable("ShoppingCarts", (string)null);
                });

            modelBuilder.Entity("Server.Models.ActiveUser", b =>
                {
                    b.HasOne("Server.Models.User", null)
                        .WithOne()
                        .HasForeignKey("Server.Models.ActiveUser", "UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Server.Models.Order", b =>
                {
                    b.HasOne("Server.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Server.Models.OrderItem", b =>
                {
                    b.HasOne("Server.Models.Order", "Order")
                        .WithMany("OrderItems")
                        .HasForeignKey("OrderId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Order");
                });

            modelBuilder.Entity("Server.Models.StoreVisit", b =>
                {
                    b.HasOne("Server.Models.Store", "Store")
                        .WithMany()
                        .HasForeignKey("StoreId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Server.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId");

                    b.Navigation("Store");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Server.Models.Order", b =>
                {
                    b.Navigation("OrderItems");
                });
#pragma warning restore 612, 618
        }
    }
}
