#!/bin/bash

# Script to clean node_modules, install dependencies, build and watch packages
# This script should be run from the root directory

# Maximum number of retry attempts
MAX_RETRIES=2
RETRY_COUNT=0

# Function to show progress
show_progress() {
    local current=$1
    local total=$2
    local step_name=$3
    local percentage=$((current * 100 / total))
    echo "[$percentage%] $step_name"
}

# Function to run command with spinner
run_with_spinner() {
    local cmd=$1
    local msg=$2

    echo -n "$msg"

    # Start the command in background
    eval $cmd > /dev/null 2>&1 &
    local pid=$!

    # Show spinner while command runs
    local spin='-\|/'
    local i=0
    while kill -0 $pid 2>/dev/null; do
        i=$(( (i+1) %4 ))
        printf "\r$msg ${spin:$i:1}"
        sleep 0.1
    done

    # Wait for command to finish and get exit code
    wait $pid
    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        printf "\r$msg ✓\n"
    else
        printf "\r$msg ✗ (failed)\n"
        return $exit_code
    fi
}

# Trap function to cleanup on exit
cleanup() {
    echo ""
    echo "Cleaning up..."
    if [ ! -z "$REGISTRY_PID" ] && kill -0 $REGISTRY_PID 2>/dev/null; then
        kill $REGISTRY_PID
        echo "Registry watch process terminated."
    fi
    if [ ! -z "$UI_PID" ] && kill -0 $UI_PID 2>/dev/null; then
        kill $UI_PID
        echo "UI watch process terminated."
    fi
    echo "=== Script terminated ==="
    exit 0
}

# Set up trap for Ctrl+C
trap cleanup SIGINT SIGTERM

run_cleanup_process() {
    echo "==== Starting cleanup process for Turtle ===="
    echo ""

    # Total steps for progress calculation
    TOTAL_STEPS=11
    CURRENT_STEP=0

        # Step 1: Remove node_modules from various directories
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Removing node_modules directories..."
    run_with_spinner "rm -rf node_modules analytics/node_modules app/node_modules site/node_modules widget/node_modules packages/eslint-config/node_modules packages/registry/node_modules packages/ui/node_modules" "Removing directories" || return 1

    # Step 2: Install dependencies with pnpm
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Installing dependencies with pnpm..."
    run_with_spinner "pnpm install" "Installing dependencies" || return 1

    # Step 3: Build packages/registry
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Building packages/registry..."
    run_with_spinner "turbo run build --filter=@velocitylabs-org/turtle-registry" "Building registry package" || return 1

    # Step 4: Build packages/ui
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Building packages/ui..."
    run_with_spinner "turbo run build --filter=@velocitylabs-org/turtle-ui" "Building UI package" || return 1

    # Step 5: Build widget
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Building widget..."
    run_with_spinner "turbo run build --filter=@velocitylabs-org/turtle-widget" "Building widget package" || return 1

    # Step 6: Start watch processes
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Starting watch processes..."
    cd packages/registry || return 1
    pnpm run watch > /dev/null 2>&1 &
    REGISTRY_PID=$!
    cd ../.. || return 1

    cd packages/ui || return 1
    pnpm run watch > /dev/null 2>&1 &
    UI_PID=$!
    cd ../.. || return 1

    echo "Watch processes started. ✓"

    # Step 7: Remove node_modules from specific directories
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Removing node_modules from specific directories..."
    run_with_spinner "rm -rf app/node_modules analytics/node_modules widget/node_modules" "Removing specific node_modules directories" || return 1

    # Step 8: Reinstall dependencies
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Reinstalling dependencies..."
    run_with_spinner "pnpm install" "Reinstalling dependencies" || return 1

    # Step 9: Let watch processes run for a specific time
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Running watch processes..."
    echo "Watch processes running for 3 seconds..."

    # Show countdown
    for i in {3..1}; do
        echo -ne "\rWatch processes running... ${i}s remaining"
        sleep 1
    done
    echo -e "\nWatch time completed. ✓"

    # Step 10: Terminate watch processes
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Terminating watch processes..."
    if [ -n "$REGISTRY_PID" ] && kill -0 $REGISTRY_PID 2>/dev/null; then
        kill $REGISTRY_PID
        echo "Registry watch process terminated. ✓"
    fi
    if [ -n "$UI_PID" ] && kill -0 $UI_PID 2>/dev/null; then
        kill $UI_PID
        echo "UI watch process terminated. ✓"
    fi

    # Step 11: Complete
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Process completed!"

    echo ""
    echo "==== All operations completed successfully ===="
    return 0
}

# Main execution with retry logic
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if run_cleanup_process; then
        exit 0
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo ""
            echo "==== Process failed! Retrying from start (Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES) ===="
            echo ""
            sleep 2
        else
            echo ""
            echo "==== Process failed after $MAX_RETRIES attempts. Please check the errors above. ===="
            exit 1
        fi
    fi
done