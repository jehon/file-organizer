
# shellcheck disable=SC2034
if [ "$BASH" ]; then
	SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
	JHCOLORS=1
else
	JHCOLORS=0
fi

# Create a "3"rd out where all structured messages will go
# This allow us to capture stdout and stderr everywhere, 
# while still letting passing through the messages "Success / failure / ..."
exec 3>&2

if [ "$LOGLEVEL" = "" ]; then
	LOGLEVEL=5
fi

# Obsolete when header menu adapted
TW="`stty size 2>/dev/null | cut -d " " -f 2 2>/dev/null`"
if [ "$TW" = "" ]; then
	TW=0
	JHCOLORS=0
else
	if [ -z "$BASH" ]; then
		JHCOLORS=0
	else
		JHCOLORS=1
	fi
fi
if [ $TW -lt 10 ];	then
	TW=100
fi


############ log_* ###########################

#
# Log something for message (on >&3)
#
log_message() {
    ( echo "$@" ) >&3
}

#
# Errors:
#   2:  system error
#   4:  general informations
#   5:  <default level>
#   10: information
#
log_error() {
	(
		if [ $LOGLEVEL -gt 2 ]; then
			if [ "$JHCOLORS" = "1" ]; then
				echo -en '\e[01;31m'
			fi
			echo -n "[ERROR] $1"
			if [ "$2" != "" ]; then
				echo -n ": $2"
			fi
			if [ "$JHCOLORS" = "1" ]; then
				echo -en '\e[00m'
			fi
			echo ""
		fi
	) >&3
}

log_info() {
	(
		if [ $LOGLEVEL -gt 4 ]; then
			if [ "$JHCOLORS" = "1" ]; then
				echo -en '\e[01;36m'
			fi
			echo -n "[INFO] $1"
			if [ "$2" != "" ]; then
				echo -n ": $2"
			fi
			if [ "$JHCOLORS" = "1" ]; then
				echo -en '\e[00m'
			fi
			echo ""
		fi
	) >&3
}

log_debug() {
	(
		if [ $LOGLEVEL -ge 8 ]; then
			if [ "$JHCOLORS" = "1" ]; then
				echo -en '\e[38;5;11m'
			fi
			echo -n "[DEBUG] $(date +%S.%N) $1"
			if [ "$2" != "" ]; then
				echo -n ": $2"
			fi
			if [ "$JHCOLORS" = "1" ]; then
				echo -en '\e[00m'
			fi
			echo ""
		fi
	) >&3
}

log_debug_internal() {
	(
		if [ $LOGLEVEL -ge 12 ]; then
			if [ "$JHCOLORS" = "1" ]; then
				echo -en '\e[1;30m'
			fi
			echo -n "[DEBUG] $1"
			if [ "$2" != "" ]; then
				echo -n ": $2"
			fi
			if [ "$JHCOLORS" = "1" ]; then
				echo -en '\e[00m'
			fi
			echo ""
		fi
	) >&3
}

#
# Log the success (with a green ✓)
#
log_success() {
    (
        echo -e "\e[1;32m\xE2\x9C\x93\e[1;00m '\e[1;33m$1\e[00m' success"
    ) >&3
}

#
# Log the failure and exit with code '1' (with a red ✘)
#
log_failure() {
    (
		if [ ! -z "$CAPTURED_OUTPUT" ]; then
        	echo "*** Captured output begin ***"
        	echo -e "$CAPTURED_OUTPUT"
        	echo "*** Captured output end ***"
		fi
        echo -e "\e[1;31m\xE2\x9C\x98\e[1;00m '\e[1;33m$1\e[00m' failure: \e[1;31m$2\e[1;00m"
        echo "To have potentially more details, please run your tests with LOGLEVEL=10"
    ) >&3
    exit 1
}

############ Capture ###########################
capture() {
	CAPTURED_HEADER="$1"
    CAPTURED_OUTPUT=""
	CAPTURED_EXITCODE=0
	shift

	if [ -z "$1" ]; then
		echo "Usage: capture <header> <command> <arg>+ "
		exit 255
	fi

    while read -r LINE ; do
        log_debug "$LINE"
        if [ "$CAPTURED_OUTPUT" = "" ]; then
            CAPTURED_OUTPUT="${LINE}"
        else
            CAPTURED_OUTPUT="${CAPTURED_OUTPUT}\n${LINE}"
        fi
    done < <( "$@" 2>&1 )

	wait "$!"
	CAPTURED_EXITCODE="$?"

    log_debug ""
	return $CAPTURED_EXITCODE
}

capture_file() {
	capture "$1" cat "$2"
}

capture_empty() {
	CAPTURED_HEADER=""
    CAPTURED_OUTPUT=""
	CAPTURED_EXITCODE=0
}

capture_dump() {
	(
		if [ ! -z "$CAPTURED_OUTPUT" ]; then
			echo "*** Captured output begin ***"
			echo -e "$CAPTURED_OUTPUT"
			echo "*** Captured output end ***"
		fi
	) >&3
}

capture_dump_to_file() {
	if [ -z "$1" ]; then
		log_error "[capture_dump_to_file] Specify file as [1]"
		exit 255
	fi
	echo -e "$CAPTURED_OUTPUT" > "$1"
}


############ Testing ###########################

assert_true() {
	local V=$?
	if [ ! -z "$2" ]; then
		V="$2"
	fi
    if (( V != 0 )) ; then
        log_failure "$1" "($2)"
    fi
    log_success "$1"
}

assert_equal() {
	if [ "$2" = "$3" ]; then
	    log_success "$1"
	else
		log_failure "$1: $2 expected, received $3"
	fi
}

assert_captured_success() {
    if [[ $CAPTURED_EXITCODE -gt 0 ]]; then
        log_failure "$CAPTURED_HEADER: $1" "command return $CAPTURED_EXITCODE"
		return $CAPTURED_EXITCODE
    fi
    log_success "$CAPTURED_HEADER: $1"
}

assert_captured_failure() {
    if [[ $CAPTURED_EXITCODE -eq 0 ]]; then
        log_failure "$CAPTURED_HEADER: $1" "command return $CAPTURED_EXITCODE (success)"
		return $CAPTURED_EXITCODE
    fi
    log_success "$CAPTURED_HEADER: $1"
}

assert_captured_output_contains() {
	local MSG="$1"
	local TEST="$2"
	if [ -z "$1" ]; then
		echo "Usage: assert_captured_output_contains [header] <expected-regex>"
		echo "   header default to contains"
		exit 255
	fi
	if [ -z "$TEST" ]; then
		TEST="$MSG"
	fi

	local FOUND=0
	local BACKUP_IFS="$IFS"
	IFS='\n'

	while read -r R; do
        if [[ "$R" =~  $TEST ]]; then
            FOUND=1
            LINE="[=>] $R" >&3
        else
            LINE="[  ] $R" >&3
        fi
        log_debug "$LINE"
	done < <(echo -e "$CAPTURED_OUTPUT")
	IFS="$BACKUP_IFS"
    log_debug ""

    if [ $FOUND != 1 ]; then
        log_failure "$CAPTURED_HEADER: $MSG" "$TEST not found in output"
		return 1
    fi
    log_success "$CAPTURED_HEADER: $MSG"
}

############ Helpers  ##################
jhYesNo() {
    read -p "$1 [yn] " YN
    if [ "${YN:0:1}" = "y" ]; then
		return 0
	fi
	return 1
}

############ Locks  ##################
# Can not use arrays, since it is a bash extension, and we want it to run on sh either
jhAcquiredLocksN=0
jhLockAcquire() {
	# This lock check if the process is really running
	if [ -z "$1" ]; then
		echo "jhLockAcquire: LockFile(1)" "$1"
		exit 255
	fi
	log_debug_internal "Acquiring lock '$1'... "
	if [ "$JEHON_SKIP_LOCKS" != "" ]; then
		log_debug_internal "Skipping locks by JEHON_SKIP_LOCKS"
		return 0
	fi

	if [ -f "$1" ]; then
		LID=$(cat "$1")
		if kill -s 0 "$LID" > /dev/null 2>&1 ; then
			log_error "Acquiring lock '$1' failed"
			return 1
		fi
	fi
	log_debug_internal "Acquiring lock '$1' ok"
	echo $$ > "$1"

	eval jhAcquiredLocks_${jhAcquiredLocksN}="$1"
	jhAcquiredLocksN=$(($jhAcquiredLocksN + 1))
	return 0
}

jhLockRelease() {
	if [ -z "$1" ]; then
		echo "jhLockRelease: LockFile(1)" "$1"
		exit 255
	fi
	
	if [ "$JEHON_SKIP_LOCKS" != "" ]; then
		log_debug_internal "Skipping locks by JEHON_SKIP_LOCKS"
		return 0
	fi

	# Match at the beginning of the line, to avoid getting "current line"
	for i in `set | grep -e "^jhAcquiredLocks_" | sed -n 's/=.*$//p'`; do
		eval LI=\$$i
		if [ "$LI" = "$1" ]; then
			unset $i
		fi
	done

	if [ -f "$1" ]; then
		rm "$1"
		log_debug_internal "Releasing lockfile '$1' ok"
		return 0
	else
		log_debug_internal "Releasing lockfile '$1' not present"
    return 10
	fi
}

# ############ Summary of steps ##################
# SUMMARY=""
# HEAD=""

# jhHeaderLine() {
# 	if [ "$JHCOLORS" = "0" ]; then
# 		echo "$1"
# 	else
# 		echo -e "\e[01;34m$1\e[00m"
# 	fi
# }

# jhHeaderBegin() {
# 	HEAD="$HEAD > $1"
# 	jhHeaderLine "+++ $HEAD"
# 	LAB="$HEAD"
# }

# jhHeaderResult() {
# 	RES="$1"
# 	if [ "$RES" = "0" ]; then
# 		RES="[ OK ]"
# 		COLOR="01;32m"
# 	else
# 		if [ "$RES" = "-1" ]; then
# 			RES="[ -- ]"
# 			COLOR="033m"
# 		else
# 			COLOR="01;31m"
# 		fi
# 	fi

# 	TTH=$(( $TW - ${#RES} - 2 ))
# 	# Minimum is 0:
# 	TTH=$(( $TTH>0 ? $TTH : 0 ))
# 	TXT=`printf "%-${TTH}.${TTH}s %s" "$LAB" "$RES"`

# 	if [ "$JHCOLORS" = "0" ]; then
# 		printf "%-${TTH}.${TTH}s %s\n" "... $LAB" "$RES"
# 	else
# 		printf "\e[01;34m%-${TTH}.${TTH}s \e[${COLOR}%s\e[00m\n"  "... $LAB" "$RES"
# 	fi

# 	SUMMARY="${SUMMARY}${TXT}\n"
# }

# jhHeaderEnd() {
# 	if [ "$1" != "" ]; then
# 		jhHeaderResult "$1"
# 	fi
# 	NH=${HEAD% >*}
# 	if [ "$NH" = "$HEAD" ]; then
# 		HEAD=""
# 	else
# 		HEAD="$NH"
# 	fi
# 	LAB="$HEAD"
# }

# jhHeaderExec() {
# 	jhHeaderBegin "$1"
# 	shift
# 	"$@"
# 	local HXRES=$?
# 	if [ "$1" == "rsync" ] || [[ "$1" =~ jh-rsync.* ]]; then
# 		if [ "$HXRES" == "0" ];   then jhHeaderEnd 0;                                                return 0; fi;
# 		if [ "$HXRES" == "1" ];   then jhHeaderEnd "rsync #${HXRES}: Syntax error";                  return 1; fi;
# 		if [ "$HXRES" == "10" ];  then jhHeaderEnd "rsync #${HXRES}: I/O Socket error";              return 10; fi;
# 		if [ "$HXRES" == "11" ];  then jhHeaderEnd "rsync #${HXRES}: I/O File error";                return 11; fi;
# 		if [ "$HXRES" == "12" ];  then jhHeaderEnd "rsync #${HXRES}: Permission error";              return 12; fi;
# 		if [ "$HXRES" == "20" ];  then jhHeaderEnd "rsync #${HXRES}: Received SIGUSR1 or SIGINT";    return 20; fi;
# 		if [ "$HXRES" == "25" ];  then jhHeaderEnd "rsync #${HXRES}: Max-delete limit reached";      return 25; fi;
# 		if [ "$HXRES" == "30" ];  then jhHeaderEnd "rsync #${HXRES}: Time-out in send/receive";      return 30; fi;
# 		if [ "$HXRES" == "35" ];  then jhHeaderEnd "rsync #${HXRES}: Time-out connecting to daemon"; return 35; fi;
# 		if [ "$HXRES" == "255" ]; then jhHeaderEnd "rsync #${HXRES}: unknown error";                 return 255; fi;
# 		jhHeaderEnd "rsync result[$HXRES]"
# 	else
# 		jhHeaderEnd "$HXRES"
# 	fi
# 	return "$HXRES"
# }

jhInternalExiting () {
	# Backup the exit value, which would be otherwise modified by the next function runned
	IRES="$?"
	log_debug_internal "jhInternalExiting: trap Exit received [backup exit value: $IRES]"

	# if [ "$SUMMARY" != "" ]; then
	# 	# Display summary if necessary
	# 	if [ "$HEAD" != "" ]; then
	# 		echo "jhHeader's not properly closed: remain '$HEAD'"
	# 	fi

	# 	COLOR_BEGIN=""
	# 	COLOR_END=""
	# 	if [ "$JHCOLORS" = "1" ]; then
	# 		COLOR_BEGIN="\e[01;32m"
	# 		COLOR_END="\e[00m"
	# 	fi
	# 	echo -e "$COLOR_BEGIN=================$COLOR_END"
	# 	echo -e "$COLOR_BEGIN==== RESULTS ====$COLOR_END"
	# 	echo -e "$COLOR_BEGIN=================$COLOR_END"

	# 	echo -e "$SUMMARY"
	# fi


	# http://unix.stackexchange.com/a/140597
	set | sed -n '/^jhAcquiredLocks_[^=]*=/s///p' | while read -r lock ; do
	  	echo "Lock to be automatically released: $lock"
		jhLockRelease $lock
  	done

	exit $IRES
}

if [ ! -z $TW ]; then
	trap jhInternalExiting EXIT
fi

############ Debug functions ##################
jh_debug_trap () {
	printf "\e[01;34m[%s-%s] %s \e[00m\n" "${BASH_SOURCE[0]}" "${BASH_LINENO[0]}" "$BASH_COMMAND"
}

jh_debug () {
	trap jh_debug_trap DEBUG
	LOGLEVEL=10
}

jh_debug_dump_parameters() {
	local I=0
	while [[ $1 != "" ]]
	do
		I=$(($I + 1))
		echo -ne "$I: .$1."
		shift
	done
}
