"""
URL configuration for BudgetPlanner project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from BudgetPlanner.views import sign_in, sign_up, edit_balance, get_balance, create_category, list_categories, \
    get_category, edit_category, delete_category, list_outcomes, list_outcomes_with_statistics, get_outcome, \
    add_outcome, edit_outcome, delete_outcome

urlpatterns = [
    path('admin/', admin.site.urls),

    path('sign-in/', sign_in, name='sign_in'),
    path('sign-up/', sign_up, name='sign_up'),

    path('edit-balance/', edit_balance, name='edit-balance'),
    path('get-balance/', get_balance, name='get-balance'),

    path('create-category/', create_category, name='create-category'),
    path('list-categories/', list_categories, name='list-categories'),
    path('get-category/<int:category_id>/', get_category, name='get-category'),
    path('edit-category/<int:category_id>/', edit_category, name='edit-category'),
    path('delete-category/<int:category_id>/', delete_category, name='delete-category'),

    path('list-outcomes/', list_outcomes, name='list_outcomes'),
    path('list-outcomes-with-statistics/', list_outcomes_with_statistics, name='list_outcomes_with_statistics'),
    path('get-outcome/<int:outcome_id>/', get_outcome, name='get_outcome'),
    path('add-outcome/', add_outcome, name='add_outcome'),
    path('edit-outcome/<int:outcome_id>/', edit_outcome, name='edit_outcome'),
    path('delete-outcome/<int:outcome_id>/', delete_outcome, name='delete_outcome'),
]
