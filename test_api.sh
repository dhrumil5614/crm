#!/bin/bash

# Test script to verify form access and comments functionality
echo "========================================="
echo "Testing CRM API - Form Access & Comments"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:5001/api"

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s "$API_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ API is running${NC}"
    echo "$HEALTH_RESPONSE" | python3 -m json.tool
else
    echo -e "${RED}✗ API health check failed${NC}"
    exit 1
fi
echo ""

# Note: The following tests require authentication
# You'll need to login first to get a token

echo -e "${YELLOW}Instructions for Manual Testing:${NC}"
echo ""
echo "1. User Side Testing:"
echo "   - Login to the application as a regular user"
echo "   - Navigate to your forms/history page"
echo "   - Verify that forms are displayed without errors"
echo "   - Click on a form to view details"
echo "   - Try adding a comment/remark"
echo ""
echo "2. Admin Side Testing:"
echo "   - Login as an admin user"
echo "   - Navigate to 'All Forms' or 'Pending Forms'"
echo "   - Verify forms are displayed correctly"
echo "   - Click on a form to view details and comments"
echo "   - Try approving/rejecting a form with a comment"
echo ""
echo "3. Expected Results:"
echo "   - No server errors (500) when accessing forms"
echo "   - Forms display correctly with all fields"
echo "   - Comments/remarks are visible and can be added"
echo "   - No console errors related to 'remarks.userId'"
echo ""
echo -e "${GREEN}Backend server is ready for testing!${NC}"
