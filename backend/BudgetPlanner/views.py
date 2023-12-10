from django.contrib.auth import authenticate, login
from django.db import models
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Category, Outcome
from .serializers import SignInSerializer, SignUpSerializer, EditBalanceSerializer, BalanceSerializer, \
    CategorySerializer, OutcomeSerializer, AddOutcomeSerializer, OutcomeStatisticsSerializer, UserProfileSerializer


# ! sign in (login)
@api_view(['POST'])
@permission_classes([AllowAny])
def sign_in(request):
    if request.method == 'POST':
        serializer = SignInSerializer(data=request.data)
        print(serializer)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# sign up (register)
@api_view(['POST'])
@permission_classes([AllowAny])
def sign_up(request):
    if request.method == 'POST':
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# editing balance
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def edit_balance(request):
    if request.method == 'POST':
        serializer = EditBalanceSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            amount = serializer.validated_data['amount']

            # Perform balance update logic here, e.g., add the amount to the user's balance
            user.balance += amount
            user.save()

            return Response({'message': 'Balance updated successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# getting balance
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_balance(request):
    if request.method == 'GET':
        user = request.user
        balance_serializer = BalanceSerializer({'balance': user.balance})
        return Response(balance_serializer.data, status=status.HTTP_200_OK)

# adding category
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_category(request):
    if request.method == 'POST':
        user = request.user
        request.data['user'] = user.id

        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# get category by id
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_category(request, category_id):
    if request.method == 'GET':
        category = Category.objects.get(pk=category_id)
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)

# list of categories
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_categories(request):
    if request.method == 'GET':
        user = request.user
        created_at = request.query_params.get('created_at', None)

        if created_at:
            categories = Category.objects.filter(user=user, created_at__icontains=created_at)
        else:
            categories = Category.objects.filter(user=user)

        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# editing category
@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def edit_category(request, category_id):
    if request.method == 'PATCH':
        category = Category.objects.get(pk=category_id)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# delete category
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_category(request, category_id):
    if request.method == 'DELETE':
        category = Category.objects.get(pk=category_id)
        category.delete()
        return Response({'message': 'Category deleted successfully'}, status=status.HTTP_200_OK)

# list of outcomes (filter by category, price more than or less than, created_at)
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_outcomes(request):
    if request.method == 'GET':
        user = request.user

        # Get filter parameters from request query parameters
        category_id = request.query_params.get('category_id', None)
        min_price = request.query_params.get('min_price', None)
        max_price = request.query_params.get('max_price', None)
        created_at = request.query_params.get('created_at', None)

        # Start with a queryset of all outcomes for the user
        outcomes = Outcome.objects.filter(user=user)

        # Apply filters based on parameters
        if category_id:
            outcomes = outcomes.filter(category_id=category_id)

        if min_price:
            outcomes = outcomes.filter(amount__gte=min_price)

        if max_price:
            outcomes = outcomes.filter(amount__lte=max_price)

        if created_at:
            outcomes = outcomes.filter(created_at__icontains=created_at)

        serializer = OutcomeSerializer(outcomes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# list of outcomes for statistics with percentage for each category
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_outcomes_with_statistics(request):
    if request.method == 'GET':
        user = request.user

        # Get all outcomes for the user
        outcomes = Outcome.objects.filter(user=user)

        # Calculate total amount of all outcomes
        total_outcomes = outcomes.aggregate(total_amount=Sum('amount', output_field=DecimalField()))['total_amount']

        # Get statistics for each category
        categories_statistics = (
            Category.objects.filter(user=user)
            .annotate(total_amount=Sum('outcome__amount', output_field=DecimalField()))
            .values('id', 'name', 'total_amount')
        )
        #
        # Serialize the data
        serializer = OutcomeStatisticsSerializer(categories_statistics, many=True,
                                                 context={'total_outcomes': total_outcomes})
        return Response(serializer.data, status=status.HTTP_200_OK)


# get outcome by id
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_outcome(request, outcome_id):
    try:
        user = request.user
        outcome = Outcome.objects.get(id=outcome_id, user=user)
        serializer = OutcomeSerializer(outcome)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Outcome.DoesNotExist:
        return Response({'message': 'Outcome not found'}, status=status.HTTP_404_NOT_FOUND)

# add outcome
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_outcome(request):
    if request.method == 'POST':
        serializer = AddOutcomeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            user = request.user
            balance_serializer = BalanceSerializer({'balance': user.balance})
            return Response({'outcome': serializer.data, 'balance': balance_serializer.data['balance']}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# edit outcome
@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def edit_outcome(request, outcome_id):
    try:
        user = request.user
        outcome = Outcome.objects.get(id=outcome_id, user=user)
    except Outcome.DoesNotExist:
        return Response({'message': 'Outcome not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        serializer = AddOutcomeSerializer(outcome, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# delete outcome
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_outcome(request, outcome_id):
    user = request.user
    outcome = get_object_or_404(Outcome, id=outcome_id, user=user)

    if request.method == 'DELETE':
        outcome.delete()
        return Response({'message': 'Outcome deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# update user profile
@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_profile(request):
    if request.method == 'PATCH':
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            user.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ...

# get user data
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    if request.method == 'GET':
        user = request.user
        user_data = {
            'email': user.email,
            'username': user.username,
            'phone_number': user.phone_number,
        }
        return Response(user_data, status=status.HTTP_200_OK)
