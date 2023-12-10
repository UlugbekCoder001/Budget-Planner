from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

from .models import User, Category, Outcome


# sign in (login) serializer
class SignInSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    tokens = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'tokens')

    def get_tokens(self, obj):
        user = get_object_or_404(User, username=obj.username)
        return {
            'refresh': user.tokens()['refresh'],
            'access': user.tokens()['access']
        }

    def validate(self, attrs):
        username = attrs.get('username', '')
        password = attrs.get('password', '')
        try:

            user = authenticate(username=username, password=password)
        except Exception as e:
            print(e)
        if not user:
            raise AuthenticationFailed(_('Invalid credentials, please try again'))
        # if not user.is_active:
        #     raise AuthenticationFailed(_("Account is disabled, please contact the administrator"))

        return {
            'username': user.username,
            'tokens': self.get_tokens(user),
        }

# sign up (register) serializer
class SignUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'phone_number', 'password', 'username')

    email = serializers.EmailField(required=False)
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already registered.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_phone_number(self, value):
        value = value.replace(' ', '')
        if value[0] != '+':
            raise serializers.ValidationError('Phone number must start with `+`.')
        if not value[1:].isdigit():
            raise serializers.ValidationError('Phone number must consist of digits only.')
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')

        user = User.objects.create_user(password=password, **validated_data)

        return user

# edit balance serializer
class EditBalanceSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)

# getting balance serializer
class BalanceSerializer(serializers.Serializer):
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

# adding category serializers
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'user']

# Outcomes Serializers Statistics
class OutcomeStatisticsSerializer(serializers.Serializer):
    category_id = serializers.IntegerField(source='id')
    category_name = serializers.CharField(source='name')
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    percentage = serializers.SerializerMethodField()

    def get_percentage(self, obj):
        total_outcomes = self.context.get('total_outcomes')
        total_amount = obj.get('total_amount')
        if total_outcomes is not None and total_amount is not None and total_outcomes != 0:
            return (total_amount / total_outcomes) * 100
        return 0

# Outcomes Serializers
class OutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Outcome
        fields = ['id', 'amount', 'user', 'category', 'created_at']

# Adding Outcome Serializers
class AddOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Outcome
        fields = ['id', 'amount', 'category']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        outcome = Outcome.objects.create(user=user, **validated_data)
        return outcome



class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'phone_number', 'username', 'first_name', 'last_name']

    def validate_username(self, value):
        return value

    def validate_email(self, value):
        return value

    def validate_phone_number(self, value):
        return value