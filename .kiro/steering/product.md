# Product Overview

This is the frontend application for the Hacktiv8 Laravel Final Project - an e-commerce platform. The frontend is built with Vue 3 and serves as the user interface for a comprehensive e-commerce system.

## Core Features

- **Product Management**: Browse and view product catalogs with categories
- **Shopping Cart**: Add, update, and manage items in shopping cart
- **User Authentication**: Register, login, and user session management
- **Transaction Processing**: Complete purchases and track order status
- **Role-Based Access**: Different interfaces for customers, editors, moderators, and admins
- **File Management**: Product image uploads and storage handling

## User Roles

- **Customer**: Browse products, manage cart, create transactions
- **Editor**: Manage products and categories
- **Moderator**: Manage transactions and view audit trails
- **Admin**: Full system access including user management

## Backend Integration

The frontend communicates with a Laravel API backend that provides:

- RESTful API endpoints for all operations
- Token-based authentication via Laravel Sanctum
- Comprehensive audit trail system
- Role-based permission system
