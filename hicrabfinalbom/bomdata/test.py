# Function to calculate the total amount
def calculate_amount(rate, discount_percentage, quantity):
    # Calculate discount
    discount_amount = rate * (discount_percentage / 100)
    # Calculate discounted rate
    discounted_rate = rate - discount_amount
    # Calculate total amount
    total_amount = discounted_rate * quantity
    return total_amount

# Get user input
rate = float(input("Enter the rate: "))
discount_percentage = float(input("Enter the discount percentage: "))
quantity = int(input("Enter the quantity: "))

# Calculate the amount
total_amount = calculate_amount(rate, discount_percentage, quantity)

# Display the result
print(f"The total amount is: {total_amount}")
